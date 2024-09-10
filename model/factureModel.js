const { addDays } = require("date-fns");
const mongoose = require("mongoose");

const factureSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    devis: { type: mongoose.Schema.Types.ObjectId, ref: "Devis" },
    bonLivraison: String,
    payer: {
      type: Boolean,
      default: false,
    },
    limitPaymentDate: {
      type: Date,
      default: addDays(new Date(), 90),
    },
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

factureSchema.pre(/^find/, function (next) {
  this.find({ active: true });
  next();
});

const Facture = mongoose.model("Facture", factureSchema);

module.exports = Facture;
