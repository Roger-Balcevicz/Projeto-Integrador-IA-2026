import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WhatsappClientService } from './whatsapp-client.service';

@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [WhatsappClientService],
  exports: [WhatsappClientService],
})
export class WhatsappClientModule {}
