const express = require(`express`);
const router = express.Router();
const Post = require(`../../models/Post`);
const Category = require(`../../models/Category`);
const Admin = require(`../../models/Admin`);
const Price = require(`../../models/Price`);
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
  Post.find({})
    .populate("category")
    // .populate("prices")
    .then(posts => {
      res.render(`useradmins/post`, {
        posts: posts
      });
    });
});

router.post(`/`, (req, res) => {
  var checker = false;

  Post.findOne({
      _id: req.body.id
    })
    .populate("prices")
    .then(post => {

      post.prices.forEach(function (item, index, arr) {
        if (arr[index].user == req.user.id) {


          Price.findByIdAndUpdate(
            arr[index]._id
          ).then(user => {
            // console.log(req.body.id);
            // console.log(req.user.id);

            // console.log(arr[index].user);
            user.prices = req.body.prices;
            user.save().then(update => {
              req.flash(
                `success_message`,
                `Price successfully Updated`
              );
              res.redirect(`/useradmins/post`);
            });
          });
          checker = true;

        }

      });
      if (!checker) {
        const newPrice = new Price({
          user: req.user.id,
          prices: req.body.prices
        });
        post.prices.push(newPrice);
        post.save().then(savePost => {
          newPrice.save().then(savePrice => {
            req.flash(
              `success_message`,
              `Price successfully set`
            );
            res.redirect(`/useradmins/post`);
          });
        });

      } else {

        checker = false;

      }
    });


});

module.exports = router;