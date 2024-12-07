import { model, Schema } from 'mongoose';
import Counter from './counterModel.js';
import articleSchema from './ArticleSchema.js';

const devisSchema = new Schema(
    {
        numero: { type: Number },
        client: { type: Schema.Types.ObjectId, ref: 'Client' },
        facture: { type: Schema.Types.ObjectId, ref: 'Facture' },
        object: {
            type: String,
            required: [true, 'Please add Object'],
        },
        articles: [articleSchema],
        bonCommand: String,
        numeroBonCommand: String,
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

devisSchema.pre(/^find/, function (next) {
    this.find({ active: true });
    next();
});

// Before saving a new Devis, increment the user's counter
devisSchema.pre('save', async function (next) {
    if (!this.isNew) return next(); // Only increment on new documents

    const currentYear = new Date().getFullYear();
    try {
        // Find the user's counter, or create one if it doesn't exist
        let counter = await Counter.findOneAndUpdate(
            { user: this.user, year: currentYear },
            { $inc: { 'count.devis': 1 } }, // Increment the counter
            { new: true, upsert: true } // Create the counter if it doesn't exist
        );

        // Set the numero field based on the user's counter
        this.numero = counter.count.devis;
        next();
    } catch (err) {
        next(err);
    }
});

const Devis = model('Devis', devisSchema);

export default Devis;
