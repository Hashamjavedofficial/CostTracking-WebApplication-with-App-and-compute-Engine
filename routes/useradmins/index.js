const express = require(`express`);
const router = express.Router();
const Post = require(`../../models/Post`);
const Category = require(`../../models/Category`);
const Price = require(`../../models/Price`);
const Admin = require(`../../models/Admin`);
const User = require(`../../models/User`);
const {
  isEmpty,
  uploadDir
} = require(`../../helpers/upload-helper`);
const fs = require(`fs`);
const path = require(`path`);
const {
  userAuthenticated
} = require(`../../helpers/userauthentication`);

router.all(`/*`, userAuthenticated, (req, res, next) => {
  req.app.locals.layout = `useradmins`;
  next();
});

router.get(`/`, (req, res) => {

  Post.count().then(postCount => {
    Price.count().then(priceCount => {
      res.render(`useradmins/index`, {
        postCount: postCount,
        priceCount: priceCount
      });
    });
  });


});

router.get(`/prices`, (req, res) => {
  Price.find({
      user: req.user.id
    })
    .populate(`user`)
    .then(prices => {
      res.render(`useradmins/prices`, {
        prices: prices
      });
    });
});

router.delete(`/prices/:id`, (req, res) => {
  Price.remove({
    _id: req.params.id
  }).then(deletedItem => {
    Post.updateOne({
        prices: req.params.id
      }, {
        $pull: {
          prices: req.params.id
        }
      },
      (err, data) => {
        if (err) console.log(err);
        console.log(data);
        res.redirect(`/useradmins/prices`);
      }
    );
  });
});

module.exports = router;