import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import whatsappWeb from 'whatsapp-web.js';
import { WhatsappEvents } from '../whatsapp/whatsapp-events';
import { BotMessageBufferService } from './bot-message-buffer.service';

@Injectable()
export class WhatsappBotListener {
  private readonly logger = new Logger(WhatsappBotListener.name);

  constructor(private readonly botMessageBuffer: BotMessageBufferService) {}

  @OnEvent(WhatsappEvents.MESSAGE_CREATED)
  async processMessageCreated(message: whatsappWeb.Message) {
    const chat = await message.getChat();
    const contact = await message.getContact();

    if (contact.isMe) {
      this.logger.log(`New message sent to ${chat.name}: ${message.body}`);
    } else {
      const contactName = contact.name ?? contact.number;
      this.logger.log(
        `New message from ${contactName}${chat.isGroup ? ` in ${chat.name}` : ''}: ${message.body}`,
      );
    }
  }

  @OnEvent(WhatsappEvents.MESSAGE_RECEIVED)
  async processMessageReceived(message: whatsappWeb.Message) {
    const chat = await message.getChat();
    this.botMessageBuffer.enqueue(chat, message);
  }
}
