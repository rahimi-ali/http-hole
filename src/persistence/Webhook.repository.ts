import db from '../util/mongodb';
import { ObjectId, OptionalId } from 'mongodb';
import { CreateWebhookDto } from '../dto/CreateWebhook.dto';
import { WebhookDto } from '../dto/Webhook.dto';
import { WebhookWithStatsDto } from '../dto/WebhookWithStats.dto';

const statsAggregationPipeline = [
  {
    $lookup: {
      from: "webhookCalls",
      localField: "_id",
      foreignField: "webhookId",
      as: "calls",
    },
  },
  {
    $addFields: {
      lastCalledAt: {
        $max: "$calls.createdAt",
      },
      firstCalledAt: {
        $min: "$calls.createdAt",
      },
      callCount: {
        $size: "$calls",
      },
    },
  },
  {
    $project: {
      calls: 0,
    },
  }
];

export async function persistWebhook(webhook: CreateWebhookDto): Promise<WebhookWithStatsDto> {
  const collection = db.collection<OptionalId<WebhookDto>>('webhooks');

  const webhookWithTimestamp = { ...webhook, createdAt: new Date() };

  const insertResult = await collection.insertOne(webhookWithTimestamp);

  const withStats = await findWebhookById(insertResult.insertedId);

  if (withStats === null) {
    throw new Error('Webhook not found after creation.');
  }

  return withStats;
}

export async function updateWebhook(webhook: WebhookDto): Promise<void> {
  const collection = db.collection<WebhookDto>('webhooks');

  await collection.updateOne({ _id: webhook._id }, { $set: webhook });
}

export async function deleteWebhook(id: ObjectId): Promise<void> {
  const collection = db.collection<WebhookDto>('webhooks');

  await collection.deleteOne({ _id: id});
}

export async function findWebhookByPathOrId(pathOrId: string): Promise<WebhookWithStatsDto | null> {
  const isObjectId = ObjectId.isValid(pathOrId);

  if (!isObjectId) {
    return await findWebhookByPath(pathOrId);
  } else {
    return await findWebhookById(pathOrId);
  }
}

export async function findWebhookByPath(path: string): Promise<WebhookWithStatsDto | null> {
  const collection = db.collection<WebhookDto>('webhooks');

  const result = await (await collection.aggregate<WebhookWithStatsDto>([
    {
      $match: {
        "path": path
      }
    },
    ...statsAggregationPipeline,
  ])).toArray();

  if (result.length === 0) {
    return null;
  }

  return result[0];
}

export async function getAllWebhooks(): Promise<WebhookWithStatsDto[]> { // TODO: add pagination
  const collection = db.collection<WebhookDto>('webhooks');

  return await (await collection.aggregate<WebhookWithStatsDto>([
    ...statsAggregationPipeline,
    {
      $sort: {
        lastCalledAt: -1
      }
    }
  ])).toArray();
}

export async function findWebhookById(id: ObjectId|string): Promise<WebhookWithStatsDto | null> {
  const collection = db.collection<WebhookDto>('webhooks');

  const objectId = typeof id === 'string' ? new ObjectId(id) : id;

  const result = await (await collection.aggregate<WebhookWithStatsDto>([
    {
      $match: {
        "_id": objectId
      }
    },
    ...statsAggregationPipeline,
  ])).toArray();

  if (result.length === 0) {
    return null;
  }

  return result[0];
}