import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhatsappBotListener } from './bot/whatsapp-bot.listener';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WhatsappModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [EventEmitterModule.forRoot(), WhatsappModule],
  controllers: [AppController],
  providers: [AppService, WhatsappBotListener],
})
export class AppModule {}
