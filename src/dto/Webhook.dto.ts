import { ObjectId } from 'mongodb';

export interface WebhookDto {
  _id: ObjectId;
  name: string;
  description: string|null;
  path: string;
  createdAt: Date;
}