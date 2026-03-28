import { Chat, Message } from 'whatsapp-web.js';
import { Injectable, Logger } from '@nestjs/common';
import { WhatsappBotService } from './whatsapp-bot.service';

@Injectable()
export class BotMessageBufferService {
  private readonly logger = new Logger(BotMessageBufferService.name);

  private readonly messageQueuesByChat: Map<string, Message[]> = new Map();
  private readonly timeoutsByChat: Map<string, NodeJS.Timeout> = new Map();

  constructor(private readonly whatsappBotService: WhatsappBotService) {}

  enqueue(chat: Chat, message: Message) {
    const chatId = chat.id._serialized;

    this.logger.log(`New message from chat ${chatId} - Adding to queue`);
    if (!this.messageQueuesByChat.get(chatId)) {
      this.messageQueuesByChat.set(chatId, []);
    }

    const messages = this.messageQueuesByChat.get(chatId)!;
    this.logger.log(`Current chat queue size: ${messages.length}`);

    messages.push(message);

    this.invalidateTimeout(chatId);
    this.timeoutsByChat.set(
      chatId,
      setTimeout(() => this.flush(chat, messages), 10000),
    );
  }

  private invalidateTimeout(chatId: string) {
    const timeout = this.timeoutsByChat.get(chatId);
    if (timeout) {
      clearTimeout(timeout);
      this.timeoutsByChat.delete(chatId);
    }
  }

  private flush(chat: Chat, messages: Message[]): void {
    const chatId = chat.id._serialized;

    this.whatsappBotService.handleMessageBatch(chat, messages);
    this.messageQueuesByChat.set(chatId, []);
    this.timeoutsByChat.delete(chatId);
  }
}
