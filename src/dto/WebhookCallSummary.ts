import { ObjectId } from 'mongodb';

export interface WebhookCallSummaryDto {
  _id: ObjectId;
  webhookId: ObjectId;
  path: string;
  method: string;
  clientIp: string;
  createdAt: Date;
}