import { Request, Response } from 'express';
import {
  deleteWebhook,
  findWebhookByPath,
  findWebhookByPathOrId,
  getAllWebhooks,
  persistWebhook, updateWebhook,
} from '../persistence/Webhook.repository';
import { matchRegex, required, stringType, validate } from '../util/validation';
import { CreateWebhookDto } from '../dto/CreateWebhook.dto';
import { getWebhookCallsSummaryByWebhookId } from '../persistence/WebhookCall.repository';

const webhookSchema = {
  name: [ required, stringType ],
  description: [ stringType ],
  path: [
    required,
    stringType,
    matchRegex(/^[a-zA-Z0-9\-_]+$/),
    (value: any) => value !== 'hole' || 'This path is reserved.',
  ],
};

const index = async (request: Request, response: Response) => {
  return response.render('webhooks/index', { webhooks: await getAllWebhooks() });
};

const show = async (request: Request, response: Response) => {
  const webhook = await findWebhookByPathOrId(request.params.id);
  if (webhook === null) {
    return response.status(404).send('Not Found!');
  }

  const calls = await getWebhookCallsSummaryByWebhookId(webhook._id);

  return response.render('webhooks/show', { webhook, calls });
};

const create = async (request: Request, response: Response) => {
  return response.render('webhooks/create');
};

const store = async (request: Request, response: Response) => {
  const validationResult = validate(request.body, webhookSchema);
  if (!validationResult.valid) {
    return response.render('webhooks/create', { errors: validationResult.errors, old: request.body });
  }

  const alreadyExisting = await findWebhookByPath(request.body.path);
  if (alreadyExisting !== null) {
    return response.render('webhooks/create', {
      errors: {
        path: `Already registered for another webhook.`,
      },
      old: request.body,
    });
  }

  const data: CreateWebhookDto = validationResult.validated as CreateWebhookDto;
  const persistedWebhook = await persistWebhook(data);

  return response.redirect(`/hole/webhooks/${ persistedWebhook.path }`);
};

const edit = async (request: Request, response: Response) => {
  const webhook = await findWebhookByPathOrId(request.params.id);
  if (webhook === null) {
    return response.status(404).send('Not Found!');
  }

  return response.render('webhooks/edit', { webhook });
};

const update = async (request: Request, response: Response) => {
  const webhook = await findWebhookByPathOrId(request.params.id);
  if (webhook === null) {
    return response.status(404).send('Not Found!');
  }

  const schema: any = { ...webhookSchema };
  delete schema.path;

  const validationResult = validate(request.body, schema);
  if (!validationResult.valid) {
    return response.render('webhooks/edit', { errors: validationResult.errors, webhook });
  }

  const updated = { ...webhook, ...validationResult.validated };
  await updateWebhook(updated);

  return response.redirect(`/hole/webhooks/${ webhook.path }`);
};

const destroy = async (request: Request, response: Response) => {
  const webhook = await findWebhookByPathOrId(request.params.id);
  if (webhook === null) {
    return response.status(404).send('Not Found!');
  }

  await deleteWebhook(webhook._id);

  return response.redirect(`/hole/webhooks`);
};

export default { index, create, store, show, edit, update, destroy };