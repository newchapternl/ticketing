import { Publisher, Subjects, OrderCreatedEvent } from '@newchapter.nl/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
}