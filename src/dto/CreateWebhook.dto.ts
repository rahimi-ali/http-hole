export interface CreateWebhookDto {
  name: string;
  description: string|null;
  path: string;
}