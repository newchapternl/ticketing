import { Message } from 'node-nats-streaming';
import { Subjects, Listener, OrderCreatedEvent } from '@newchapter.nl/common';
import { queueGroupName } from './queue-group-name';
import { expirationQueue } from '../../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    // subject: Subjects.TicketCreated = Subjects.TicketCreated;
    readonly subject = Subjects.OrderCreated;

    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
        console.log('Waiting this many milliseconds to process the job: ', delay);

        await expirationQueue.add({
            orderId: data.id
        }, {
            delay
        });

        msg.ack();
    }
}