import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderCreatedEvent, OrderStatus } from "@newchapter.nl/common";
import { OrderCreatedListener } from "../order-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Order } from "../../../models/order";

const setup = async () => {
    // Create an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client);

    // Create a fake data event
    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: 'ABC123',
        expiresAt: '123',
        ticket: {
            id: 'XYZ789',
            price: 10
        }
    };

    // Create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg };
}

it('Replicated the order info', async () => {
    const { listener, data, msg } = await setup();
    
    // Call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // Write assertions to make sure a ticket was created
    const order = await Order.findById(data.id);

    expect(order!.price).toEqual(data.ticket.price);
});

it('Acks the message', async () => {
    const { listener, data, msg } = await setup();
    
    // Call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // Write assertions to make sure a ticket was created
    expect(msg.ack).toHaveBeenCalled();
});
