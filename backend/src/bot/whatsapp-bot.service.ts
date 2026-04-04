import { WhatsappClientService } from '../whatsapp-client/whatsapp-client.service';
import { Injectable, Logger } from '@nestjs/common';
import { Message } from 'whatsapp-web.js';

@Injectable()
export class WhatsappBotService {
  private readonly logger = new Logger(WhatsappBotService.name);
  private readonly ollamaBaseUrl =
    process.env.OLLAMA_BASE_URL?.trim() || 'http://127.0.0.1:11434';
  private readonly ollamaModel =
    process.env.OLLAMA_MODEL?.trim() || 'atendimento-qwen:dev';
  private readonly systemPrompt =
    process.env.OLLAMA_SYSTEM_PROMPT?.trim() ||
    [
      'Você é um atendente humano de loja de fotografia.',
      'Responda em português brasileiro com tom natural, cordial e objetivo.',
      'Evite mencionar que é IA ou chatbot.',
      'Mantenha as respostas curtas e faça no máximo uma pergunta por vez.',
    ].join(' ');
  private readonly ollamaStreamLogs =
    (process.env.OLLAMA_STREAM_LOGS || 'false').toLowerCase() === 'true';
  private readonly ollamaTimeoutMs = Number(process.env.OLLAMA_TIMEOUT_MS || 90000);
  private readonly ollamaNumPredict = Number(process.env.OLLAMA_NUM_PREDICT || 220);
  private readonly ollamaThink =
    (process.env.OLLAMA_THINK || 'false').toLowerCase() === 'true';

  constructor(private readonly whatsappService: WhatsappClientService) {}

  public handleMessageBatch(chatId: string, messages: Message[]) {
    void this.processBatch(chatId, messages);
  }

  private async processBatch(chatId: string, messages: Message[]) {
    this.logger.log(
      `Consuming queue from chat ${chatId} (queue size: ${messages.length})...`,
    );

    const userInput = messages
      .map((message) => message.body?.trim())
      .filter((body): body is string => Boolean(body))
      .join('\n');

    if (!userInput) {
      this.logger.log('No text content found in queued messages, skipping AI call');
      return;
    }

    try {
      this.logger.log(`Calling Ollama model "${this.ollamaModel}"...`);
      const aiResponse = await this.generateReply(userInput);
      const sanitizedReply = aiResponse.slice(0, 3000).trim();
      if (!sanitizedReply) {
        this.logger.warn('Ollama returned empty content, sending fallback message');
        await this.whatsappService.sendMessage(
          chatId,
          'Não consegui responder agora. Pode repetir sua mensagem em uma frase curta?',
        );
        return;
      }

      this.logger.log(
        `Generated reply (${sanitizedReply.length} chars). Sending to chat ${chatId}...`,
      );
      await this.whatsappService.sendMessage(chatId, sanitizedReply);
      this.logger.log(`Reply sent to chat ${chatId}`);
    } catch (error) {
      this.logger.error('Something went wrong while generating/sending message', error);
    }
  }

  private async generateReply(userInput: string): Promise<string> {
    const controller = new AbortController();
    let abortedByTimeout = false;
    const timeout = setTimeout(() => {
      abortedByTimeout = true;
      controller.abort();
    }, this.ollamaTimeoutMs);

    let response: Response;
    try {
      response = await fetch(`${this.ollamaBaseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: this.ollamaModel,
          stream: true,
          think: this.ollamaThink,
          options: {
            num_predict: this.ollamaNumPredict,
          },
          messages: [
            { role: 'system', content: this.systemPrompt },
            { role: 'user', content: userInput },
          ],
        }),
      });
    } catch (error) {
      if (abortedByTimeout) {
        throw new Error(
          `Ollama timed out after ${this.ollamaTimeoutMs}ms while opening the response`,
        );
      }
      throw error;
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Ollama request failed with status ${response.status}: ${errorText}`,
      );
    }

    if (!response.body) {
      throw new Error('Ollama response body is empty');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';
    let fullThinking = '';

    if (this.ollamaStreamLogs) {
      this.logger.log('Ollama stream started');
      process.stdout.write('\n[OLLAMA STREAM] ');
    }

    try {
      for await (const chunk of response.body) {
        buffer += decoder.decode(chunk, { stream: true });

        let newLineIndex = buffer.indexOf('\n');
        while (newLineIndex !== -1) {
          const line = buffer.slice(0, newLineIndex).trim();
          buffer = buffer.slice(newLineIndex + 1);

          if (line) {
            const payload = JSON.parse(line) as {
              message?: {
                content?: string;
                thinking?: string;
                reasoning_content?: string;
              };
              response?: string;
              content?: string;
              thinking?: string;
              reasoning_content?: string;
              done?: boolean;
            };

            const answerToken =
              payload.message?.content ?? payload.response ?? payload.content ?? '';
            const thinkingToken =
              payload.message?.thinking ??
              payload.message?.reasoning_content ??
              payload.thinking ??
              payload.reasoning_content ??
              '';

            if (answerToken) {
              fullContent += answerToken;
              if (this.ollamaStreamLogs) {
                process.stdout.write(answerToken);
              }
            }

            if (thinkingToken) {
              fullThinking += thinkingToken;
              if (this.ollamaStreamLogs && this.ollamaThink) {
                process.stdout.write(thinkingToken);
              }
            }

            if (payload.done && this.ollamaStreamLogs) {
              process.stdout.write('\n');
              this.logger.log('Ollama stream finished');
            }
          }

          newLineIndex = buffer.indexOf('\n');
        }
      }
    } catch (error) {
      if (abortedByTimeout) {
        throw new Error(
          `Ollama timed out after ${this.ollamaTimeoutMs}ms while reading streamed tokens`,
        );
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }

    const remaining = buffer.trim();
    if (remaining) {
      const payload = JSON.parse(remaining) as {
        message?: {
          content?: string;
          thinking?: string;
          reasoning_content?: string;
        };
        response?: string;
        content?: string;
        thinking?: string;
        reasoning_content?: string;
      };
      fullContent += payload.message?.content ?? payload.response ?? payload.content ?? '';
      fullThinking +=
        payload.message?.thinking ??
        payload.message?.reasoning_content ??
        payload.thinking ??
        payload.reasoning_content ??
        '';
    }

    if (!fullContent.trim()) {
      this.logger.warn(
        `Ollama stream finished without answer tokens. thinking_chars=${fullThinking.length}. ` +
          'Set OLLAMA_THINK=false or increase OLLAMA_NUM_PREDICT.',
      );
    }

    return fullContent.trim();
  }
}
