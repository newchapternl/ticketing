import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderCancelledEvent, OrderStatus } from "@newchapter.nl/common";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Order } from '../../../models/order';

const setup = async () => {
    // Create an instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client);

    const orderId = new mongoose.Types.ObjectId().toHexString();

    // Create and save a ticket
    const order = Order.build({
        id: orderId,
        status: OrderStatus.Created,
        price: 10,
        userId: 'ABC123',
        version: 0
    });

    await order.save();

    // Create a fake data event
    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: 1,
        ticket: {
            id: 'XYZ789'
        }
    };

    // Create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg, order };
}

it('Updates the ticket, publishes an event and acks the message', async () => {
    const { listener, data, msg, order } = await setup();
    
    // Call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // Write assertions to make sure a ticket was created
    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('Acks the message', async () => {
    const { listener, data, msg, order } = await setup();
    
    // Call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // Write assertions to make sure a ticket was created
    expect(msg.ack).toHaveBeenCalled();
});