import { WhatsappClientService } from '../whatsapp-client/whatsapp-client.service';
import { Injectable, Logger } from '@nestjs/common';
import { Chat, Message } from 'whatsapp-web.js';

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

  constructor(private readonly whatsappService: WhatsappClientService) {}

  public handleMessageBatch(chat: Chat, messages: Message[]) {
    void this.processBatch(chat, messages);
  }

  private async processBatch(chat: Chat, messages: Message[]) {
    this.logger.log(
      `Consuming queue from chat ${chat.id._serialized} (queue size: ${messages.length})...`,
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
      const aiResponse = await this.generateReply(userInput);
      const sanitizedReply = aiResponse.slice(0, 3000).trim();
      if (!sanitizedReply) {
        return;
      }

      await this.whatsappService.sendMessage(chat.id._serialized, sanitizedReply);
    } catch (error) {
      this.logger.error('Something went wrong while generating/sending message', error);
    }
  }

  private async generateReply(userInput: string): Promise<string> {
    const response = await fetch(`${this.ollamaBaseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.ollamaModel,
        stream: false,
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: userInput },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Ollama request failed with status ${response.status}: ${errorText}`,
      );
    }

    const payload = (await response.json()) as {
      message?: { content?: string };
    };

    return payload.message?.content?.trim() ?? '';
  }
}
