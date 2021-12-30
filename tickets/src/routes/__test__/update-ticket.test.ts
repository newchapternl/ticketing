import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

it('Returns a 404 if the provided ID does NOT exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', global.signin())
        .send({
            title: 'FakeTitle',
            price: 20
        })
        .expect(404);
});

it('Returns a 401 if the user is NOT authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title: 'FakeTitle',
            price: 20
        })
        .expect(401);
});

it('Returns a 401 if the user does NOT own the ticket', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'FakeTitleOne',
            price: 10
        });
    
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', global.signin())
        .send({
            title: 'FakeTitleTwo',
            price: 20
        })
        .expect(401);
});

it('Returns a 400 if the user provides an invalid title or price', async () => {
    const cookie = global.signin();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({
            title: 'FakeTitle',
            price: 20
        });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            price: 20
        })
        .expect(400);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'FakeTitle',
            price: -10
        })
        .expect(400);

});

it('Updates the ticket with the provided valid inputs', async () => {
    const cookie = global.signin();

    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({
        title: 'asldkfj',
        price: 20,
      });
  
    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({
        title: 'FakeTitle',
        price: 10,
      })
      .expect(200);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send({});

    expect(ticketResponse.body.title).toEqual('FakeTitle');
    expect(ticketResponse.body.price).toEqual(10);
});

it('Publishes an event', async () => {
    const cookie = global.signin();

    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({
        title: 'asldkfj',
        price: 20,
      });
  
    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({
        title: 'FakeTitle',
        price: 10,
      })
      .expect(200);

      expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('Rejects updates if the ticket is reserved', async () => {
    const cookie = global.signin();

    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({
        title: 'asldkfj',
        price: 20,
      });

    const ticket = await Ticket.findById(response.body.id);
    ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
    await ticket!.save();
  
    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({
        title: 'FakeTitle',
        price: 10,
      })
      .expect(400);

});