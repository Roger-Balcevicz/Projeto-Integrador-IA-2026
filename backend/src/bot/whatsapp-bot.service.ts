import { WhatsappService } from '../whatsapp/whatsapp.service';
import { Injectable, Logger } from '@nestjs/common';
import { Chat, Message } from 'whatsapp-web.js';

@Injectable()
export class WhatsappBotService {
  private logger = new Logger(WhatsappBotService.name);
  constructor(private readonly whatsappService: WhatsappService) {}

  handleMessageBatch(chat: Chat, messages: Message[]) {
    this.logger.log(
      `Consuming queue from chat ${chat.id._serialized} (queue size: ${messages.length})...`,
    );

    const pongs: string[] = [];

    messages.forEach((message) => {
      if (message.body.toLowerCase() == '!ping') {
        pongs.push('pong!');
      }
    });

    this.whatsappService
      .sendMessage(chat.id._serialized, pongs.join('\n'))
      .catch((err) => {
        this.logger.error('Something went wrong while sending message', err);
      });
  }
}
