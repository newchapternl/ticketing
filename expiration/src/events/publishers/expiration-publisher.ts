import { Publisher, Subjects, ExpirationCompleteEvent } from '@newchapter.nl/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
}