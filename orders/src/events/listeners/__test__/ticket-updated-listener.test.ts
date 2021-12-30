import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { TicketUpdatedEvent } from "@newchapter.nl/common";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from '../../../models/ticket';

const setup = async () => {
    // Create an instance of the listener
    const listener = new TicketUpdatedListener(natsWrapper.client);

    // Create and save a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 10
    });
    await ticket.save();

    // Create a fake data event
    const data: TicketUpdatedEvent['data'] = {
        version: ticket.version + 1,
        id: ticket.id,
        title: 'new concert',
        price: 50,
        userId: 'ABC123'
    };

    // Create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg, ticket };
}

it('Finds, updates and saves a ticket', async () => {
    const { listener, data, msg, ticket } = await setup();
    
    // Call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // Write assertions to make sure a ticket was created
    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);

});

it('Acks the message', async () => {
    const { listener, data, msg, ticket } = await setup();
    
    // Call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // Write assertions to make sure a ticket was created
    expect(msg.ack).toHaveBeenCalled();
});

it('Does not call ack if the event has a skipped version number', async () => {
    const { listener, data, msg, ticket } = await setup();
    
    data.version = 10;

    try {
        await listener.onMessage(data, msg);
    } catch (err) {

    }

    expect(msg.ack).not.toHaveBeenCalled();
});
