import mongoose from 'mongoose';
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { natsWrapper } from "../../../nats-wrapper";
import { Order } from '../../../models/order';
import { Ticket } from '../../../models/ticket';
import { Message } from 'node-nats-streaming';
import { ExpirationCompleteEvent, OrderStatus } from "@newchapter.nl/common";

const setup = async () => {
    // Create an instance of the listener
    const listener = new ExpirationCompleteListener(natsWrapper.client);

    // Create and save a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 10
    });
    await ticket.save();

    const order = Order.build({
        status: OrderStatus.Created,
        userId: 'ABC123',
        expiresAt: new Date(),
        ticket,
    });
    await order.save();

    // Create a fake data event
    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id,
    };

    // Create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg, ticket, order };
}

it('Updates the order status to cancelled', async () => {
    const { listener, data, msg, order } = await setup();
    
    // Call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('Emits an OrderCancelled event', async () => {
    const { listener, data, msg, order } = await setup();
    
    // Call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

    expect(eventData.id).toEqual(order.id);
});

it('Acks the message', async () => {
    const { listener, data, msg } = await setup();
    
    // Call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // Write assertions to make sure a ticket was created
    expect(msg.ack).toHaveBeenCalled();
});

