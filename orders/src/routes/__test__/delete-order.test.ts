import request from "supertest";
import { app } from "../../app";
import mongoose from 'mongoose';
import { Ticket } from "../../models/ticket";
import { Order, OrderStatus } from "../../models/order";
import { natsWrapper } from "../../nats-wrapper";

const buildTicket = async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20,

    });
    await ticket.save();

    return ticket;
}

it('Marks an order as cancelled', async () => {
    // Create a ticket
    const ticket = await buildTicket();
    const user = global.signin();

    // Make a request to build an order with this ticket
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201);

    // Make a request to cancel the order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(200);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);

});

it('Emits an order cancelled event',async () => {
    // Create a ticket
    const ticket = await buildTicket();
    const user = global.signin();

    // Make a request to build an order with this ticket
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201);

    // Make a request to cancel the order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});