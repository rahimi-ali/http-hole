import { ObjectId } from 'mongodb';
import { findWebhookByPath } from '../persistence/Webhook.repository';
import { Socket } from 'socket.io';

const onConnection = async (socket: Socket) => {
  console.log('a user connected to socket');

  socket.on("subscribe", async (subscriptionRequest: {clientId: string, topic: string}) => {
    let id = null;
    if (ObjectId.isValid(subscriptionRequest.topic)) {
      id = subscriptionRequest.topic;
    } else {
      const webhook = await findWebhookByPath(subscriptionRequest.topic);
      if (!webhook) {
        return;
      }
      id = webhook._id.toString();
    }

    socket.join(id);

    console.log(`${ subscriptionRequest.clientId } subscribed to ${ id }`);
  });

  socket.on("unsubscribe", (unsubscribeRequest: {clientId: string, topic: string}) => {
    socket.leave(unsubscribeRequest.topic);
    console.log(`${ unsubscribeRequest.clientId } unsubscribed from ${ unsubscribeRequest.topic }`);
  });
}

export default { onConnection };