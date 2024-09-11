import { addDays } from "date-fns";
import { Schema, model } from "mongoose";

const factureSchema = new Schema(
  {
    client: { type: Schema.Types.ObjectId, ref: "Client" },
    devis: { type: Schema.Types.ObjectId, ref: "Devis" },
    rapport: String,
    payer: {
      type: Boolean,
      default: false,
    },
    limitPaymentDate: {
      type: Date,
      default: addDays(new Date(), 90),
    },
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

const Facture = model("Facture", factureSchema);

export default Facture;
