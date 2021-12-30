import express from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@newchapter.nl/common';

import { createTicketRouter } from './routes/create-ticket';
import { showTicketRouter } from './routes/show-ticket';
import { indexTicketRouter } from './routes/index-ticket';
import { updateTicketRouter } from './routes/update-ticket';

const app = express();
app.set('trust proxy', true);
app.use(express.json());
app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
}));
app.use(currentUser);

app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(updateTicketRouter);

app.all('*', async (req, res) => {
    throw new NotFoundError()
});

app.use(errorHandler);

export { app };