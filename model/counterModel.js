const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const counterSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  count: { type: Number, default: 0 },
  year: { type: Number, default: new Date().getFullYear() },
});

const Counter = model("Counter", counterSchema);

module.exports = Counter;
