import mongoose from "mongoose";
const { Schema, model } = mongoose;

const counterSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  year: { type: Number, default: new Date().getFullYear() },
  count: {
    factureAvoir: {
      type: Number,
      required: true,
      default: 0,
    },
    facture: {
      type: Number,
      required: true,
      default: 0,
    },
    devis: {
      type: Number,
      required: true,
      default: 0,
    },
  },
});

const Counter = model("Counter", counterSchema);

export default Counter;
