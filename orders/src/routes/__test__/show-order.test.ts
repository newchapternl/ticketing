import request from "supertest";
import { app } from "../../app";
import mongoose from 'mongoose';
import { Ticket } from "../../models/ticket";

const buildTicket = async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });
    await ticket.save();

    return ticket;
}

it('Fetches the order', async () => {
    // Create a ticket
    const ticket = await buildTicket();
    const user = global.signin();

    // Make a request to build an order with this ticket
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201);

    // Make a request to fetch the order
    const { body: fetchedOrder } = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(200);

    expect(fetchedOrder.id).toEqual(order.id);

});

it('Returns an error if a user tries to fetch another users order', async () => {
    // Create a ticket
    const ticket = await buildTicket();
    const userOne = global.signin();
    const userTwo = global.signin();

    // Make a request to build an order with this ticket
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({ ticketId: ticket.id })
        .expect(201);

    // Make a request to fetch the order
    const { body: fetchedOrder } = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', userTwo)
        .send()
        .expect(401);
});