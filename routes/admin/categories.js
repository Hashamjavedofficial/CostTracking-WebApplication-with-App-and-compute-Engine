const express = require(`express`);
const router = express.Router();
const fileType = require('file-type');
const Category = require(`../../models/Category`);
const Post = require(`../../models/Post`);
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
  Category.find({}).then(categories => {
    res.render(`admin/categories/index`, {
      categories: categories
    });
  });
});

router.post(`/create`, (req, res) => {
  var errors = [];
  let filename = "";

  if (!req.body.name) {
    errors.push({
      message: "Name is Required"
    });
  }
  if (!req.files) {
    errors.push({
      message: "Image is Required"
    });
  }

  if (fileType(req.files.file.data).ext !== 'jpg' && fileType(req.files.file.data).ext !== 'png') {
    errors.push({
      message: "Image should be jpg or png"
    });
  }
  if (errors.length > 0) {
    res.render(`admin/categories`, {
      errors: errors
    });
  } else {
    let file = req.files.file;

    filename = Date.now() + "-" + file.name;
    file.mv(`./public/uploads/` + filename, err => {
      if (err) throw err;
    });

    const newCategory = Category({
      name: req.body.name,
      file: filename
    });

    newCategory.save().then(categorySaved => {
      req.flash(`success_message`, `Category successfully Created`);
      res.redirect(`/admin/categories`);
    });
  }



});

router.get(`/edit/:id`, (req, res) => {
  Category.findOne({
    _id: req.params.id
  }).then(category => {
    res.render(`admin/categories/edit`, {
      category: category
    });
  });
});

router.put(`/edit/:id`, (req, res) => {
  Category.findOne({
    _id: req.params.id
  }).then(category => {
    category.name = req.body.name;
    let filename = "";
    if (!isEmpty(req.files)) {
      let file = req.files.file;
      filename = Date.now() + "-" + file.name;
      category.file = filename;
      file.mv(`./public/uploads/` + filename, err => {
        if (err) throw err;
      });
    }

    category.save().then(saveCategory => {
      res.redirect(`/admin/categories`);
    });
  });
});

router.delete(`/:id`, (req, res) => {

  Category.findOne({
    _id: req.params.id
  }).then(cat => {

    Post.find({
        category: req.params.id
      })
      .populate("prices")
      .then(posts => {

        if (posts.length > 0) {
          posts.forEach(post => {
            fs.unlink(uploadDir + post.file, err => {
              if (post.prices.length > 0) {
                post.prices.forEach(price => {
                  price.remove();
                });
              }

              post.remove().then(postDeleted => {
                req.flash(`success_message`, `Post successfully Deleted`);
                res.redirect(`/admin/posts`);
              });
            });
          });
        }

      });




    //detetion for category
    fs.unlink(uploadDir + cat.file, err => {
      cat.remove();
      req.flash(`success_message`, `Category successfully Deleted`);
      res.redirect(`/admin/categories`);
    });
  });


  // Category.findOne({
  //   _id: req.params.id
  // }).then(post => {
  //   fs.unlink(uploadDir + post.file, err => {
  //     post.remove();
  //     req.flash(`success_message`, `Category successfully Deleted`);
  //     res.redirect(`/admin/categories`);
  //   });
  // });

});

module.exports = router;