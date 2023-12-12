import { Request, Response } from 'express';
import { findWebhookCallById, persistWebhookCall } from '../persistence/WebhookCall.repository';
import { CreateWebhookCallDto } from '../dto/CreateWebhookCall.dto';
import { findWebhookByPath } from '../persistence/Webhook.repository';
import { formatDateTime } from '../util/dateTime';

const show = async (request: Request, response: Response) => {
  const webhookCall = await findWebhookCallById(request.params.id);

  if (webhookCall === null) {
    return response.status(404).send('Not Found!');
  }

  return response.render('webhookCalls/show', { webhookCall });
};

const store = async (request: Request, response: Response) => {
  const path = request.path.trim().replace('/', '');

  const webhook = await findWebhookByPath(path);
  if (webhook === null) {
    console.error(`Tried to call non-existent webhook ${ path }.`);
    return response.status(404).send({ message: 'Webhook not registered.' });
  }

  console.log(`Webhook ${ path } called.`);

  const webhookCall: CreateWebhookCallDto = {
    webhookId: webhook._id,
    path: path,
    method: request.method.toUpperCase(),
    body: request.body,
    headers: request.headers,
    query: request.query,
    clientIp: request.ip || 'Disconnected',
  };

  const persistedWebhookCall = await persistWebhookCall(webhookCall);

  request.app.get('io')
    .to(webhook._id.toString())
    .emit(
      'webhook-call',
      {
        ...persistedWebhookCall,
        createdAtFormatted: formatDateTime(persistedWebhookCall.createdAt),
      },
    );

  response.status(200).send({ message: 'Received.' });
};


export default { show, store };