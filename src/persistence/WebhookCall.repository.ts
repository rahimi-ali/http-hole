import { WebhookCallDto } from '../dto/WebhookCall.dto';
import { CreateWebhookCallDto } from '../dto/CreateWebhookCall.dto';
import db from '../util/mongodb';
import { ObjectId, OptionalId } from 'mongodb';
import { WebhookCallSummaryDto } from '../dto/WebhookCallSummary';

export async function persistWebhookCall(webhookCall: CreateWebhookCallDto): Promise<WebhookCallDto> {
  const collection = db.collection<OptionalId<WebhookCallDto>>('webhookCalls');

  const webhookCallWithTimestamp = { ...webhookCall, createdAt: new Date() };

  const insertResult = await collection.insertOne(webhookCallWithTimestamp);

  return { ...webhookCallWithTimestamp, _id: insertResult.insertedId };
}

export async function findWebhookCallById(id: string): Promise<WebhookCallDto | null> {
  const collection = db.collection<WebhookCallDto>('webhookCalls');

  return await collection.findOne({ _id: new ObjectId(id) });
}

export async function getWebhookCallsSummaryByWebhookId(webhookId: ObjectId | string): Promise<WebhookCallSummaryDto[]> { // TODO: add pagination
  const collection = db.collection<WebhookCallDto>('webhookCalls');

  const webhookObjectId = typeof webhookId === 'string' ? new ObjectId(webhookId) : webhookId;

  return await (await collection.find({ webhookId: webhookObjectId })
      .project<WebhookCallSummaryDto>({
        _id: 1,
        webhookId: 1,
        path: 1,
        method: 1,
        clientIp: 1,
        createdAt: 1,
      })
      .sort('createdAt', 'desc')
  ).toArray();
}