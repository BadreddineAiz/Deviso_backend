import { Schema } from 'mongoose';
import Product from './ProductModel.js';

const articleSchema = new Schema({
    designation: {
        type: String,
        required: [true, 'Please add Designation'],
    },
    quantity: {
        type: Number,
        required: [true, 'Please add Quantity'],
    },
    prixHT: {
        type: Number,
        required: [true, 'Please add prixHT'],
    },
    tva: {
        type: Number,
        default: 0.2,
    },
    type: {
        type: String,
        enum: ['service', 'product'],
        default: 'service',
    },
    productID: { type: Schema.Types.ObjectId, ref: 'Product' },
});

articleSchema.pre('save', async function (next) {
    if (this.type == 'service') this.productID = undefined;
    if (!this.productID) return next();
    const product = await Product.findById(this.productID);
    this.designation = product.designation;
});

export default articleSchema;
