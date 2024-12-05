import { model, Schema } from 'mongoose';

const productSchema = new Schema(
    {
        designation: {
            type: String,
            required: [true, 'Please add Designation'],
        },
        quantity: {
            type: Number,
            default: 0,
        },
        prixHT: {
            type: Number,
            required: [true, 'Please add prixHT'],
        },
        tva: {
            type: Number,
            default: 0.2,
        },
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        active: {
            type: Boolean,
            default: true,
            select: false,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    }
);

const Product = model('Product', productSchema);

export default Product;
