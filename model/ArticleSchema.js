import { Schema } from "mongoose";

const articleSchema = new Schema({
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

export default articleSchema;
