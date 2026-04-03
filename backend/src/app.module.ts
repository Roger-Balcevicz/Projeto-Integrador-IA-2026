import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhatsappBotListener } from './bot/whatsapp-bot.listener';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WhatsappClientModule } from './whatsapp-client/whatsapp-client.module';
import { BotMessageBufferService } from './bot/bot-message-buffer.service';
import { WhatsappBotService } from './bot/whatsapp-bot.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskManagerModule } from './task-manager/task-manager.module';

const {
  MONGODB_HOST,
  MONGODB_PORT,
  MONGODB_DATABASE,
  MONGODB_USER,
  MONGODB_PASSWORD,
} = process.env;

const mongoUri = `mongodb://${MONGODB_HOST}:${MONGODB_PORT}`;

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    MongooseModule.forRoot(mongoUri, {
      dbName: MONGODB_DATABASE,
      user: MONGODB_USER,
      pass: MONGODB_PASSWORD,
    }),
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
