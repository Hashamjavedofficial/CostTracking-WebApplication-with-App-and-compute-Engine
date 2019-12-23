const mongoose = require(`mongoose`);
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  category: {
    type: Schema.Types.ObjectId,
    ref: "categories"
  },
  model: {
    type: String,
    required: true
  },
  status: {
    type: Boolean,
    default: true
  },

  price: {
    type: Number,
    required: true
  },
  resolution: {
    type: String,
    required: true
  },
  memory: {
    type: Number,
    required: true
  },
  camera: {
    type: String,
    required: true
  },
  battery: {
    type: Number,
    required: true
  },
  file: {
    type: String
  },
  prices: [{
    type: Schema.Types.ObjectId,
    ref: "prices"
  }]
}, {
  usePushEach: true
});

module.exports = mongoose.model(`posts`, PostSchema);