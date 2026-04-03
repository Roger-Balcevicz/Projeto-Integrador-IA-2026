import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CustomerDocument = HydratedDocument<Customer>;

@Schema()
export class Customer {
  @Prop({ required: true })
  chatId: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop()
  contactName?: string;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
