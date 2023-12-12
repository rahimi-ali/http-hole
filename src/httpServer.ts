import dotenv from 'dotenv';

dotenv.config();

import express from 'express';
const bb = require('express-busboy');
import { Application, Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

import WebhookController from './controllers/Webhook.controller';
import WebhookCallController from './controllers/WebhookCall.controller';
import { formatDateTime } from './util/dateTime';
import SocketController from './controllers/Socket.controller';

const app: Application = express();

// Socket IO
const server = createServer(app);
const io = new Server(server);
app.set('io', io);

// Form parsing
bb.extend(app);

// View engine and view utils
app.set('views', `${ __dirname }/ui/views`);
app.set('view engine', 'ejs');
app.locals.formatDate = formatDateTime;

app.get('/hole/ping', (req: Request, res: Response) => res.send('pong'));

app.get('/hole/webhooks', WebhookController.index);
app.get('/hole/webhooks/new', WebhookController.create);
app.post('/hole/webhooks/new', WebhookController.store);
app.get('/hole/webhooks/:id', WebhookController.show);
app.get('/hole/webhooks/:id/edit', WebhookController.edit);
app.post('/hole/webhooks/:id/edit', WebhookController.update);
app.post('/hole/webhooks/:id/delete', WebhookController.destroy);

app.get('/hole/webhook-calls/:id', WebhookCallController.show);

app.use('/hole/static/feathercss', express.static(`${ __dirname }/../node_modules/feathercss/dist`));
app.use('/hole/static/styles', express.static(`${ __dirname }/ui/styles`));
app.use('/hole/static/socketio', express.static(`${__dirname}/../node_modules/socket.io/client-dist`))

app.all('/hole/*', (req: Request, res: Response) => res.send('Not Found!'));
app.all('*', WebhookCallController.store);

io.on('connection', SocketController.onConnection);

server.listen(8000, '0.0.0.0', () => {
  console.log(`HTTP Webhook Server running 0.0.0.0:8000`);
});