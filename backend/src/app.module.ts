import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhatsappBotListener } from './bot/whatsapp-bot.listener';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WhatsappClientModule } from './whatsapp-client/whatsapp-client.module';
import { BotMessageBufferService } from './bot/bot-message-buffer.service';
import { WhatsappBotService } from './bot/whatsapp-bot.service';

@Module({
  imports: [EventEmitterModule.forRoot(), WhatsappClientModule],
  controllers: [AppController],
  providers: [
    AppService,
    WhatsappBotListener,
    BotMessageBufferService,
    WhatsappBotService,
  ],
})
export class AppModule {}
