import express from 'express';
import 'express-async-errors';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@newchapter.nl/common';

import { createOrderRouter } from './routes/create-order';
import { showOrderRouter } from './routes/show-order';
import { indexOrderRouter } from './routes/index-order';
import { deleteOrderRouter } from './routes/delete-order';

const app = express();
app.set('trust proxy', true);
app.use(express.json());
app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
}));
app.use(currentUser);

app.use(createOrderRouter);
app.use(showOrderRouter);
app.use(indexOrderRouter);
app.use(deleteOrderRouter);

app.all('*', async (req, res) => {
    throw new NotFoundError()
});

app.use(errorHandler);

export { app };