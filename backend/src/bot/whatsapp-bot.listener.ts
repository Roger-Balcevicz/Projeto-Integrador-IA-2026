import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import whatsappWeb from 'whatsapp-web.js';
import { WhatsappClientEvents } from '../whatsapp-client/whatsapp-client-events';
import { BotMessageBufferService } from './bot-message-buffer.service';

@Injectable()
export class WhatsappBotListener {
  private readonly logger = new Logger(WhatsappBotListener.name);
  private readonly allowedChatId = process.env.WHATSAPP_ALLOWED_CHAT_ID?.trim();

  constructor(private readonly botMessageBuffer: BotMessageBufferService) {}

  @OnEvent(WhatsappClientEvents.MESSAGE_RECEIVED)
  public processMessageReceived(message: whatsappWeb.Message) {
    const chatId = message.from ?? message.to;
    if (!chatId) {
      this.logger.warn('Received message without chat id, skipping');
      return;
    }

    if (this.allowedChatId && chatId !== this.allowedChatId) {
      return;
    }

    this.logger.log(`New received message in chat ${chatId}`);
    this.botMessageBuffer.enqueue(chatId, message);
  }
}
