import { ObjectId } from 'mongodb';

export interface WebhookWithStatsDto {
  _id: ObjectId;
  name: string;
  description: string|null;
  path: string;
  createdAt: Date;
  lastCalledAt: Date|null;
  firstCalledAt: Date|null;
  callCount: number;
}