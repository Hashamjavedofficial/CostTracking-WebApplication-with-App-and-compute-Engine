const express = require(`express`);
const router = express.Router();
const faker = require(`faker`);
const Post = require(`../../models/Post`);
const Category = require(`../../models/Category`);
const Price = require(`../../models/Price`);
const User = require(`../../models/User`);
const {
  userAuthenticated
} = require(`../../helpers/authentication`);

router.all(`/*`, userAuthenticated, (req, res, next) => {
  req.app.locals.layout = `admin`;
  next();
});

router.get(`/`, (req, res) => {

  Post.count().then(postCount => {
    User.count().then(userCount => {
      Category.count().then(categoryCount => {
        Price.count().then(priceCount => {
          res.render(`admin/index`, {
            postCount: postCount,
            userCount: userCount,
            categoryCount: categoryCount,
            priceCount: priceCount
          });
        });

      });

    });


  });



});

router.post(`/generate-fake-posts`, (req, res) => {
  for (let i = 0; i < req.body.amount; i++) {
    let post = new Post();
    post.model = faker.name.title();
    post.company = "oppo";
    post.price = faker.random.number();
    post.save().then(savePost => {});
  }
  res.redirect(`/admin/posts`);
});

module.exports = router;