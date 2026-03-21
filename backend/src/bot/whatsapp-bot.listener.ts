import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import whatsappWeb from 'whatsapp-web.js';
import { WhatsappEvents } from '../whatsapp/whatsapp-events';

@Injectable()
export class WhatsappBotListener {
  private readonly logger = new Logger(WhatsappBotListener.name);

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
  processMessageReceived(message: whatsappWeb.Message) {
    if (message.body == '!ping') {
      message.reply('pong!');
    }
  }
}
