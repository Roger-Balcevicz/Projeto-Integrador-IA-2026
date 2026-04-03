import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import whatsappWeb from 'whatsapp-web.js';
import { WhatsappClientEvents } from '../whatsapp-client/whatsapp-client-events';
import { BotMessageBufferService } from './bot-message-buffer.service';

@Injectable()
export class WhatsappBotListener {
  private readonly logger = new Logger(WhatsappBotListener.name);

  constructor(private readonly botMessageBuffer: BotMessageBufferService) {}

  @OnEvent(WhatsappClientEvents.MESSAGE_RECEIVED)
  public async processMessageReceived(message: whatsappWeb.Message) {
    const chat = await message.getChat();
    this.logger.log(`New received message in chat ${chat.id._serialized}`);
    this.botMessageBuffer.enqueue(chat, message);
  }
}
