import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhatsappBotListener } from './bot/whatsapp-bot.listener';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WhatsappClientModule } from './whatsapp-client/whatsapp-client.module';
import { BotMessageBufferService } from './bot/bot-message-buffer.service';
import { WhatsappBotService } from './bot/whatsapp-bot.service';
import { MongooseModule } from '@nestjs/mongoose';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { TaskManagerModule } from './task-manager/task-manager.module';

function loadEnvFileIfPresent(): void {
  const envPath = resolve(process.cwd(), '.env');
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const exportPrefix = line.startsWith('export ') ? 7 : 0;
    const equalSignIndex = line.indexOf('=', exportPrefix);
    if (equalSignIndex === -1) continue;

    const key = line.slice(exportPrefix, equalSignIndex).trim();
    if (!key || process.env[key] !== undefined) continue;

    let value = line.slice(equalSignIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

loadEnvFileIfPresent();

const {
  MONGODB_URI,
  MONGODB_HOST,
  MONGODB_PORT,
  MONGODB_DATABASE,
  MONGODB_USER,
  MONGODB_PASSWORD,
} = process.env;

const trimmedMongoUri = MONGODB_URI?.trim();
const isUsingMongoUri = Boolean(trimmedMongoUri);

const mongoUrl =
  trimmedMongoUri ||
  (MONGODB_HOST && MONGODB_PORT && MONGODB_DATABASE
    ? `mongodb://${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}`
    : undefined);

if (!mongoUrl) {
  throw new Error(
    'MongoDB configuration not found. Set MONGODB_URI or MONGODB_HOST/MONGODB_PORT/MONGODB_DATABASE.',
  );
}

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    MongooseModule.forRoot(
      mongoUrl,
      isUsingMongoUri
        ? {}
        : {
            dbName: MONGODB_DATABASE,
            user: MONGODB_USER,
            pass: MONGODB_PASSWORD,
          },
    ),
    WhatsappClientModule,
    TaskManagerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    WhatsappBotListener,
    BotMessageBufferService,
    WhatsappBotService,
  ],
})
export class AppModule {}

