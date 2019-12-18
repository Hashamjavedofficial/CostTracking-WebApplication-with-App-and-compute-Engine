const express = require(`express`);
const router = express.Router();
const User = require(`../../models/User`);
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
  User.find({}).then(users => {
    res.render(`admin/users/index`, {
      users: users
    });
  });
});

router.get(`/view/:id`, (req, res) => {
  User.findOne({
    _id: req.params.id
  }).then(users => {
    res.render(`admin/users/view`, {
      users: users
    });
  });
});

router.put(`/view/:id`, (req, res) => {
  User.findOne({
    _id: req.params.id
  }).then(user => {
    if (req.body.verify) {
      verify = true;
    } else {
      verify = false;
    }

    user.verify = verify;

    user.save().then(updatedPost => {
      req.flash(`success_message`, `User Verified`);
      res.redirect(`/admin/users`);
    });
  });
});

router.delete(`/:id`, (req, res) => {
  User.findOne({
    _id: req.params.id
  }).then(users => {
    fs.unlink(uploadDir + users.file, err => {
      users.remove();
      req.flash(`success_message`, `Post successfully Deleted`);
      res.redirect(`/admin/users`);
    });
  });
});

module.exports = router;