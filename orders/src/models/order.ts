import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { OrderStatus } from '@newchapter.nl/common';
import { TicketDoc } from './ticket';

export { OrderStatus };

// An interface that describes the properties that are required to create a new User
interface OrderAttributes {
    userId: string;
    status: OrderStatus;
    expiresAt: Date;
    ticket: TicketDoc;
}

// An interface that describes the properties that a User Document has
interface OrderDoc extends mongoose.Document {
    userId: string;
    version: number;
    status: OrderStatus;
    expiresAt: Date;
    ticket: TicketDoc;
}

// An interface that describes the properties that a User model has
interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attributes: OrderAttributes): OrderDoc;
}

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: Object.values(OrderStatus),
        default: OrderStatus.Created
    },
    expiresAt: {
        type: mongoose.Schema.Types.Date,
    },
    ticket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket'
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attributes: OrderAttributes) => {
    return new Order(attributes);
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);
 
export { Order };