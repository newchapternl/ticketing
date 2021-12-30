import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderCancelledEvent } from "@newchapter.nl/common";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from '../../../models/ticket';

const setup = async () => {
    // Create an instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client);

    const orderId = new mongoose.Types.ObjectId().toHexString();

    // Create and save a ticket
    const ticket = Ticket.build({
        title: 'concert',
        price: 10,
        userId: 'ABC123'
    });
    ticket.set({ orderId });

    await ticket.save();

    // Create a fake data event
    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id
        }
    };

    // Create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg, ticket, orderId };
}

it('Updates the ticket, publishes an event and acks the message', async () => {
    const { listener, data, msg, ticket, orderId } = await setup();
    
    // Call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // Write assertions to make sure a ticket was created
    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).not.toBeDefined();
    expect(msg.ack).toHaveBeenCalled();
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
