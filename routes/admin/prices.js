const express = require(`express`);
const router = express.Router();
const Post = require(`../../models/Post`);
const Category = require(`../../models/Category`);
const Price = require(`../../models/Price`);
const Admin = require(`../../models/Admin`);
const {
  isEmpty,
  uploadDir
} = require(`../../helpers/upload-helper`);
const fs = require(`fs`);
const path = require(`path`);
const {
  userAuthenticated
} = require(`../../helpers/authentication`);

router.all(`/*`, userAuthenticated, (req, res, next) => {
  req.app.locals.layout = `admin`;
  next();
});

router.get(`/`, (req, res) => {
  Price.find({})
    .populate(`user`)
    .then(prices => {
      res.render(`admin/prices`, {
        prices: prices
      });
    });
});

router.delete(`/:id`, (req, res) => {
  Price.remove({
    _id: req.params.id
  }).then(deletedItem => {
    res.redirect(`/admin/prices`);
  });
});

module.exports = router;