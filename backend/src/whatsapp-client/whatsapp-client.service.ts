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
  Bootstrapping,
  Ready,
  Authenticated,
  AuthFailure,
  Disconnected,
} from './whatsapp-client-status';

@Injectable()
export class WhatsappClientService implements OnModuleInit, OnModuleDestroy {
  private readonly client: Client;
  private readonly logger: Logger = new Logger(WhatsappClientService.name);
  private clientStatus: ClientStatus = new Bootstrapping();
  private qrLoadingInterval?: NodeJS.Timeout;
  private qrLoadingFrame = 0;
  private readonly spinnerFrames = ['|', '/', '-', '\\'];

  constructor(private readonly eventEmitter: EventEmitter2) {
    this.client = new Client({});
  }

  public async sendMessage(chatId: string, message: string) {
    await this.client.sendMessage(chatId, message);
  }

  onModuleInit(): any {
    this.registerListeners();
    this.startQrLoading();
    void this.client.initialize().catch((error: unknown) => {
      this.stopQrLoading();
      this.logger.error('Failed to initialize WhatsApp client', error);
    });
  }

  onModuleDestroy(): any {
    this.stopQrLoading();
    void this.client.destroy();
  }

  private registerListeners(): void {
    this.client.on('ready', () => {
      this.stopQrLoading();
      this.logger.log('Client is ready');
      if (!(this.clientStatus instanceof Ready)) {
        this.clientStatus = new Ready();
      }
    });

    this.client.on('authenticated', () => {
      this.stopQrLoading();
      this.logger.log('Authenticated');
      if (!(this.clientStatus instanceof Authenticated)) {
        this.clientStatus = new Authenticated();
      }
    });

    this.client.on('auth_failure', (message) => {
      this.stopQrLoading();
      this.logger.error('Authentication failed', message);
      this.clientStatus = new AuthFailure(message);
    });

    this.client.on('disconnected', (reason) => {
      this.stopQrLoading();
      this.logger.log('Disconnected', reason);
      this.clientStatus = new Disconnected(reason);
    });

    this.client.on('qr', (qr) => {
      this.stopQrLoading();
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

  private startQrLoading(): void {
    if (!process.stdout.isTTY || this.qrLoadingInterval) {
      return;
    }

    this.logger.log('Initializing WhatsApp client, waiting for QR/auth...');
    this.qrLoadingInterval = setInterval(() => {
      const frame =
        this.spinnerFrames[this.qrLoadingFrame % this.spinnerFrames.length];
      this.qrLoadingFrame += 1;
      process.stdout.write(`\r${frame} Waiting for WhatsApp authentication...`);
    }, 120);
  }

  private stopQrLoading(): void {
    if (!process.stdout.isTTY || !this.qrLoadingInterval) {
      return;
    }

    clearInterval(this.qrLoadingInterval);
    this.qrLoadingInterval = undefined;
    this.qrLoadingFrame = 0;
    process.stdout.write('\r');
    process.stdout.write(' '.repeat(60));
    process.stdout.write('\r');
  }
}
