import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WhatsappService } from './whatsapp.service';

@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
