import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Client } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WhatsappEvents } from './whatsapp-events';

@Injectable()
export class WhatsappService implements OnModuleInit, OnModuleDestroy {
  private readonly client: Client;
  private readonly logger: Logger = new Logger(WhatsappService.name);

  constructor(private readonly eventEmitter: EventEmitter2) {
    this.client = new Client({});
  }

  async sendMessage(chatId: string, message: string) {
    await this.client.sendMessage(chatId, message);
  }

  onModuleInit(): any {
    this.client.initialize();
    this.registerListeners(); // verificar se não deveria estar dentro de um .then()
  }

  onModuleDestroy(): any {
    this.client.destroy();
  }

  private registerListeners(): void {
    this.client.on('qr', (qr) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      qrcode.generate(qr, { small: true });
    });

    this.client.on('ready', () => {
      this.logger.log('Client is ready');
    });

    this.client.on('message', (message) => {
      this.waitAndEmit(WhatsappEvents.MESSAGE_RECEIVED, message);
    });

    this.client.on('message_create', (message) => {
      this.waitAndEmit(WhatsappEvents.MESSAGE_CREATED, message);
    });
  }

  private waitAndEmit(event: WhatsappEvents, payload: any) {
    setTimeout(() => this.eventEmitter.emit(event, payload), 5000);
  }
}
