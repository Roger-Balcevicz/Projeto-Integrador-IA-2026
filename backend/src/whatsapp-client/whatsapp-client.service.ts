import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Client } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WhatsappClientEvents } from './whatsapp-client-events';
import {
  ClientStatus,
  Initializing,
  Ready,
  Authenticated,
  AuthFailure,
  Disconnected,
} from './whatsapp-client-status';

@Injectable()
export class WhatsappClientService implements OnModuleInit, OnModuleDestroy {
  private readonly client: Client;
  private readonly logger: Logger = new Logger(WhatsappClientService.name);
  private clientStatus: ClientStatus = new Initializing();

  constructor(private readonly eventEmitter: EventEmitter2) {
    this.client = new Client({});
  }

  public async sendMessage(chatId: string, message: string) {
    await this.client.sendMessage(chatId, message);
  }

  onModuleInit(): any {
    this.client.initialize();
    this.registerListeners();
  }

  onModuleDestroy(): any {
    this.client.destroy();
  }

  private registerListeners(): void {
    this.client.on('ready', () => {
      this.logger.log('Client is ready');
      if (!(this.clientStatus instanceof Ready)) {
        this.clientStatus = new Ready();
      }
    });

    this.client.on('authenticated', () => {
      this.logger.log('Authenticated');
      if (!(this.clientStatus instanceof Authenticated)) {
        this.clientStatus = new Authenticated();
      }
    });

    this.client.on('auth_failure', (message) => {
      this.logger.error('Authentication failed', message);
      this.clientStatus = new AuthFailure(message);
    });

    this.client.on('disconnected', (reason) => {
      this.logger.log('Disconnected', reason);
      this.clientStatus = new Disconnected(reason);
    });

    this.client.on('qr', (qr) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      qrcode.generate(qr, { small: true });
    });

    this.client.on('message', (message) => {
      this.eventEmitter.emit(WhatsappClientEvents.MESSAGE_RECEIVED, message);
    });

    this.client.on('message_create', (message) => {
      this.eventEmitter.emit(WhatsappClientEvents.MESSAGE_CREATED, message);
    });
  }
}
