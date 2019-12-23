const mongoose = require(`mongoose`);
const Schema = mongoose.Schema;

const PriceSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },
  prices: {
    type: Number
  },
  date: {
    type: Date,
    default: Date.now()
  }
});

module.exports = mongoose.model(`prices`, PriceSchema);