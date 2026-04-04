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
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

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
    ? `mongodb://${MONGODB_HOST}:${MONGODB_PORT}`
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
    AuthModule,
    UserModule,
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
