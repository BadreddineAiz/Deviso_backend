const mongoose = require("mongoose");
const fs = require("fs");
require("dotenv").config({ path: "../config.env" });
const Product = require("../model/productModel");

const products = JSON.parse(fs.readFileSync("products_example.json", "utf-8"));

mongoose
  .connect(process.env.MONGO_URI)
  .then((response) => {
    console.log(`MongDB Connected : ${response.connection.host}`);
  })
  .catch((error) => {
    console.log("Error in DB connection: " + error);
  });

const importData = async () => {
  try {
    await Product.create(products);
    console.log("Data uploaded successfully !");
    process.exit(1);
  } catch (err) {
    console.log(err);
  }
};

const deleteAllData = async () => {
  try {
    await Product.deleteMany();
    console.log("Data Deleted successfully !");
    process.exit(1);
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] == "--import") {
  importData();
} else if (process.argv[2] == "--delete") {
  deleteAllData();
}
