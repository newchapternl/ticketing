import { Publisher, Subjects, PaymentCreatedEvent } from '@newchapter.nl/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
}