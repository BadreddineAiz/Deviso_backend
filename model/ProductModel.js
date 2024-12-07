import { model, Schema } from 'mongoose';
import { validate } from 'uuid';

const productSchema = new Schema(
    {
        image: {
            type: String,
            default: '/default-product.png',
        },
        designation: {
            type: String,
            required: [true, 'Please add Designation'],
        },
        barcode: {
            type: String,
        },
        quantity: {
            type: Number,
            default: 0,
            validate: {
                validator: function (value) {
                    return value >= 0;
                },
                message: 'La quantité doit être inférieure ou égale à 0.',
            },
        },
        minimalQuantity: {
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

productSchema.pre(/^find/, function (next) {
    this.find({ active: true });
    next();
});

const Product = model('Product', productSchema);

export default Product;
