const mongoose = require(`mongoose`);
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  shopName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: Number,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  long: {
    type: Number,
    required: true
  },
  lat: {
    type: Number,
    required: true
  },
  verify: {
    type: Boolean,
    require: true
  },
  password: {
    type: String,
    required: true
  },
  file: {
    type: String
  }
});

module.exports = mongoose.model(`users`, UserSchema);
