const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PlantSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  image: { type: String },
  category: [{ type: Schema.Types.ObjectId, ref: "Category" }],
});

PlantSchema.virtual("url").get(function () {
  return `/catalog/plant/${this._id}`;
});

// Export model
module.exports = mongoose.model("Plant", PlantSchema);
