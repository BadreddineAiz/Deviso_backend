const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const clientSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please add Name"],
    },
    tel: String,
    ice: String,
    address: String,
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

clientSchema.pre(/^find/, function (next) {
  this.find({ active: true });
  next();
});

const Client = model("Client", clientSchema);

module.exports = Client;
