const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DomainSchema = new mongoose.Schema({
  domain: String,
});

const UrlSchema = new mongoose.Schema({
  url: String,
});

const CategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  domains: [String],
  urls: [String],
});

module.exports = mongoose.model("Category", CategorySchema);
