import { Publisher, Subjects, TicketCreatedEvent } from '@newchapter.nl/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}