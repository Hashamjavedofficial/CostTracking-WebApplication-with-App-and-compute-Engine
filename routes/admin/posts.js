const express = require(`express`);
const router = express.Router();
const Post = require(`../../models/Post`);
const Category = require(`../../models/Category`);
const fileType = require('file-type');
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

// for admin render

router.get(`/`, (req, res) => {
  Post.find({})
    .populate("category")
    .then(posts => {
      res.render(`admin/posts`, {
        posts: posts
      });
    });
});

//create posts

router.get(`/create`, (req, res) => {
  Category.find({}).then(categories => {
    res.render("admin/posts/create", {
      categories: categories
    });
  });
});

//create page post request validation

router.post(`/create`, (req, res) => {
  let errors = [];

  if (!req.body.model) {
    errors.push({
      message: "Pleasea add a Model Number"
    });
  }
  if (!req.body.price) {
    errors.push({
      message: "Please add a Price of the product"
    });
  }
  if (!req.files) {
    errors.push({
      message: "Please Upload the Image"
    });
  }
  if (!req.body.resolution) {
    errors.push({
      message: "Please add Resolution"
    });
  }
  if (!req.body.memory) {
    errors.push({
      message: "Please add Memory"
    });
  }
  if (!req.body.camera) {
    errors.push({
      message: "Please add camera"
    });
  }
  if (!req.body.battery) {
    errors.push({
      message: "Please add battery"
    });
  }
  if (errors.length > 0) {
    res.render(`admin/posts/create`, {
      errors: errors
    });
  } else {
    let filename = "";

    if (!isEmpty(req.files)) {
      let file = req.files.file;
      filename = Date.now() + "-" + file.name;
      file.mv(`./public/uploads/` + filename, err => {
        if (err) throw err;
      });
    }

    const newPost = new Post({
      model: req.body.model,
      price: req.body.price,
      resolution: req.body.resolution,
      memory: req.body.memory,
      camera: req.body.camera,
      battery: req.body.battery,
      category: req.body.category,
      file: filename
    });
    newPost
      .save()
      .then(savePost => {
        req.flash(
          `success_message`,
          `Post ${savePost.model} successfully created`
        );
        console.log(`Data saved`);
        res.redirect(`/admin/posts`);
      })
      .catch(err => {
        console.log(err);
      });
  }


});

//edit page get request to send objects

router.get(`/edit/:id`, (req, res) => {
  Post.findOne({
    _id: req.params.id
  }).then(post => {
    Category.find({}).then(categories => {
      res.render(`admin/posts/edit`, {
        post: post,
        categories: categories
      });
    });
  });
});

//update function for editing put request managing

router.put(`/edit/:id`, (req, res) => {
  Post.findOne({
    _id: req.params.id
  }).then(post => {
    post.model = req.body.model;
    post.company = req.body.company;
    post.price = req.body.price;
    post.resolution = req.body.resolution;
    post.memory = req.body.memory;
    post.camera = req.body.camera;
    post.battery = req.body.battery;
    post.category = req.body.category;

    let filename = "";
    if (!isEmpty(req.files)) {
      let file = req.files.file;
      filename = Date.now() + "-" + file.name;
      post.file = filename;
      file.mv(`./public/uploads/` + filename, err => {
        if (err) throw err;
      });
    }

    post.save().then(updatedPost => {
      req.flash(`success_message`, `Post successfully Updated`);
      res.redirect(`/admin/posts`);
    });
  });
});

//delete the data

router.get(`/delete/:id`, (req, res) => {
  Post.findOne({
      _id: req.params.id
    })
    .populate("prices")
    .then(post => {
      fs.unlink(uploadDir + post.file, err => {
        if (!post.prices.length < 1) {
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
});

router.post("/status", (req, res) => {
  Post.findByIdAndUpdate(req.body.id, {
    $set: {
      status: req.body.status
    }
  }, (err, result) => {
    if (err) return err;

    res.send(result);
  });
});

module.exports = router;