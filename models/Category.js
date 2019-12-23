const mongoose = require(`mongoose`);
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  name: {
    type: String,
    required: true
  },
  file: {
    type: String
  }
});

module.exports = mongoose.model(`categories`, CategorySchema);
