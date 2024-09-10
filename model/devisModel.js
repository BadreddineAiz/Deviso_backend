const mongoose = require("mongoose");
const Counter = require("./counterModel.js");

const articleSchema = new mongoose.Schema({
  designation: {
    type: String,
    required: [true, "Please add Designation"],
  },
  quantity: {
    type: Number,
    required: [true, "Please add Quantity"],
  },
  prixHT: {
    type: Number,
    required: [true, "Please add prixHT"],
  },
  tva: {
    type: Number,
    default: 0.2,
  },
});

const devisSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    facture: { type: mongoose.Schema.Types.ObjectId, ref: "Facture" },
    object: {
      type: String,
      required: [true, "Please add Object"],
    },
    numero: { type: Number },
    articles: [articleSchema],
    bonCommand: String,
    numeroBonCommand: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
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
devisSchema.pre("save", async function (next) {
  if (!this.isNew) return next(); // Only increment on new documents

  const currentYear = new Date().getFullYear();
  try {
    // Find the user's counter, or create one if it doesn't exist
    let counter = await Counter.findOneAndUpdate(
      { user: this.user, year: currentYear },
      { $inc: { count: 1 } }, // Increment the counter
      { new: true, upsert: true } // Create the counter if it doesn't exist
    );

    // Set the numero field based on the user's counter
    this.numero = counter.count;
    next();
  } catch (err) {
    next(err);
  }
});

const Devis = mongoose.model("Devis", devisSchema);

module.exports = Devis;
