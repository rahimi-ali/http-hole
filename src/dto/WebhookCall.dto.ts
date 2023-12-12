import { ObjectId } from 'mongodb';

export interface WebhookCallDto {
  _id: ObjectId;
  webhookId: ObjectId;
  path: string;
  method: string;
  clientIp: string;
  body: Record<string, any>;
  headers: Record<string, any>;
  query: Record<string, any>;
  createdAt: Date;
}