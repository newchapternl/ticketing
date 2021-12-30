import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

// An interface that describes the properties that are required to create a new User
interface PaymentAttributes {
    orderId: string;
    stripeId: string;
}

// An interface that describes the properties that a User Document has
interface PaymentDoc extends mongoose.Document {
    orderId: string;
    stripeId: string;
}

// An interface that describes the properties that a User model has
interface PaymentModel extends mongoose.Model<PaymentDoc> {
    build(attributes: PaymentAttributes): PaymentDoc;
}

const paymentSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
    },
    stripeId: {
        type: String,
        required: true,
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

paymentSchema.set('versionKey', 'version');
paymentSchema.plugin(updateIfCurrentPlugin);

paymentSchema.statics.build = (attributes: PaymentAttributes) => {
    return new Payment(attributes);
};

const Payment = mongoose.model<PaymentDoc, PaymentModel>('Payment', paymentSchema);
 
export { Payment };