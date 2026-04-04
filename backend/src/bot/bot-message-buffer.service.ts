import { Message } from 'whatsapp-web.js';
import { Injectable, Logger } from '@nestjs/common';
import { WhatsappBotService } from './whatsapp-bot.service';

@Injectable()
export class BotMessageBufferService {
  private readonly logger = new Logger(BotMessageBufferService.name);

  private readonly messageQueuesByChat: Map<string, Message[]> = new Map();
  private readonly timeoutsByChat: Map<string, NodeJS.Timeout> = new Map();

  constructor(private readonly whatsappBotService: WhatsappBotService) {}

  public enqueue(chatId: string, message: Message) {
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
      setTimeout(() => this.flush(chatId, messages), 10000),
    );
  }

  private invalidateTimeout(chatId: string) {
    const timeout = this.timeoutsByChat.get(chatId);
    if (timeout) {
      clearTimeout(timeout);
      this.timeoutsByChat.delete(chatId);
    }
  }

  private flush(chatId: string, messages: Message[]): void {
    this.whatsappBotService.handleMessageBatch(chatId, messages);
    this.messageQueuesByChat.set(chatId, []);
    this.timeoutsByChat.delete(chatId);
  }
}
