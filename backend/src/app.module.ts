import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhatsappBotListener } from './bot/whatsapp-bot.listener';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WhatsappClientModule } from './whatsapp-client/whatsapp-client.module';
import { BotMessageBufferService } from './bot/bot-message-buffer.service';
import { WhatsappBotService } from './bot/whatsapp-bot.service';
import { MongooseModule } from '@nestjs/mongoose';

const { MONGODB_HOST, MONGODB_PORT, MONGODB_DATABASE } = process.env;

const mongoUrl = `mongodb://${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}`;

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    WhatsappClientModule,
    MongooseModule.forRoot(mongoUrl),
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
