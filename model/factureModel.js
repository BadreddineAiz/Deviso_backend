import { addDays } from "date-fns";
import { Schema, model } from "mongoose";
import Counter from "./counterModel.js";
import articleSchema from "./ArticleSchema.js";

const factureSchema = new Schema(
  {
    numero: { type: Number },
    client: { type: Schema.Types.ObjectId, ref: "Client" },
    devis: { type: Schema.Types.ObjectId, ref: "Devis" },
    rapport: String,
    numeroBonCommand: String,
    object: {
      type: String,
      required: [true, "Please add Object"],
    },
    bonCommand: String,
    articles: [articleSchema],
    refFacture: {
      id: { type: Schema.Types.ObjectId, ref: "Facture" },
      numero: { type: Number },
    },
    totalAmount: { type: Number, default: 0 },
    payer: {
      type: Boolean,
      default: false,
    },
    limitPaymentDate: {
      type: Date,
      default: addDays(new Date(), 90),
    },
    isAvoir: { type: Boolean, default: false },
    user: { type: Schema.Types.ObjectId, ref: "User" },
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

factureSchema.pre(/^find/, function (next) {
  this.find({ active: true });
  next();
});

// Before saving a new Facture, increment the user's counter
factureSchema.pre("save", async function (next) {
  if (!this.isNew) return next(); // Only increment on new documents

  const currentYear = new Date().getFullYear();
  const countObj = this.isAvoir
    ? { "count.factureAvoir": 1 }
    : { "count.facture": 1 };
  try {
    // Find the user's counter, or create one if it doesn't exist
    let counter = await Counter.findOneAndUpdate(
      { user: this.user, year: currentYear },
      { $inc: countObj }, // Increment the counter
      { new: true, upsert: true } // Create the counter if it doesn't exist
    );

    // Set the numero field based on the user's counter
    this.numero = counter.count[this.isAvoir ? "factureAvoir" : "facture"];
    next();
  } catch (err) {
    next(err);
  }
});

const Facture = model("Facture", factureSchema);

export default Facture;
