import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { Order, OrderStatus } from './order';

// An interface that describes the properties that are required to create a new User
interface TicketAttributes {
    id: string;
    title: string;
    price: number;
}

// An interface that describes the properties that a User Document has
export interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    version: number;
    isReserved(): Promise<boolean>;
}

// An interface that describes the properties that a User model has
interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attributes: TicketAttributes): TicketDoc;
    findByEvent(event: { id: string, version: number }): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

// OPTION WITHOUT PLUGIN mongoose-update-if-current
// ticketSchema.pre('save', function() {
//     this.$where = {
//         version: this.get('version') - 1
//     };
// });

ticketSchema.statics.findByEvent = (event: { id:string, version: number }) => {
    return Ticket.findOne({
        _id: event.id,
        version: event.version - 1
    })
};

ticketSchema.statics.build = (attributes: TicketAttributes) => {
    return new Ticket({
        _id: attributes.id,
        title: attributes.title,
        price: attributes.price
    });
};

ticketSchema.methods.isReserved = async function() {
    const existingOrder = await Order.findOne({
        ticket: this,
        status: {
          $in: [
            OrderStatus.Created,
            OrderStatus.AwaitingPayment,
            OrderStatus.Complete
          ]
        }
      });

      return !!existingOrder;

}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);
 
export { Ticket };