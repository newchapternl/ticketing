import { Publisher, Subjects, OrderCancelledEvent } from '@newchapter.nl/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
}