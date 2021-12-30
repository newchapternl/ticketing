import { Publisher, Subjects, TicketUpdatedEvent } from '@newchapter.nl/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}