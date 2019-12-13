const express = require(`express`);
const router = express.Router();
const Post = require(`../../models/Post`);
const Category = require(`../../models/Category`);
const User = require(`../../models/User`);
const Admin = require(`../../models/Admin`);
const bcrypt = require(`bcryptjs`);
const passport = require(`passport`);
const LocalStrategy = require(`passport-local`).Strategy;
const {
  isEmpty,
  uploadDir
} = require(`../../helpers/upload-helper`);
const fs = require(`fs`);
const path = require(`path`);

router.all(`/*`, (req, res, next) => {
  req.app.locals.layout = `home`;
  next();
});

router.get(`/`, (req, res) => {
  Post.find({}).then(posts => {
    Category.find({}).then(categories => {
      res.render(`home/index`, {
        categories: categories
      });
    });
  });
});

router.get(`/aboutUs`, (req, res) => {
  res.render(`home/aboutUs`);
});

router.get(`/contact_us`, (req, res) => {
  res.render(`home/contact_us`);
});

router.get(`/laptop`, (req, res) => {
  res.render(`home/laptop`);
});

//for admin render login

router.get(`/login`, (req, res) => {
  res.render(`home/login`);
});

//login user render

router.get(`/userlogin`, (req, res) => {
  res.render(`home/userlogin`);
});


//login page post request handling :D

passport.use(
  "admin",
  new LocalStrategy({
      usernameField: "email"
    },
    (email, password, done) => {
      console.log(password);

      Admin.findOne({
        email: email
      }).then(user => {
        if (!user)
          return done(null, false, {
            message: `No user found`
          });

        bcrypt.compare(password, user.password, (err, matched) => {
          if (err) return err;

          if (matched) {
            return done(null, user);
          } else {
            return done(null, false, {
              message: `Incorrect Password`
            });
          }
        });
      });
    }
  )
);

//passport serialize

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
  let admin = await Admin.findById(id);
  if (admin) {
    return done(null, admin);
  }
  let user = await User.findById(id);
  if (user) {
    return done(null, user);
  }
  done(null, null);
});

router.post(`/login`, (req, res, next) => {
  passport.authenticate(`admin`, {
    successRedirect: `/admin`,
    failureRedirect: `/login`,
    failureFlash: true
  })(req, res, next);
});




//login page user post request handling :D

passport.use(
  "user",
  new LocalStrategy({
      usernameField: "email"
    },
    (email, password, done) => {
      // console.log(password);
      User.findOne({
        email: email
      }).then(async user => {
        if (!user) {
          return done(null, false, {
            message: `No user found`
          });
        }
        if (!user.verify) {
          return done(null, false, {
            message: `User not verified`
          });
        }
        let matched = await bcrypt.compare(password, user.password);
        if (matched) {
          console.log('ok');
          return done(null, user);
        } else {
          return done(null, false, {
            message: `Incorrect Password`
          });
        }

      });
    }
  )
);



router.post(`/userlogin`, (req, res, next) => {
  passport.authenticate(`user`, {
    successRedirect: `/useradmins`,
    failureRedirect: `/userlogin`,
    failureFlash: true
  })(req, res, next);
});


//logout route

router.get(`/logout`, (req, res) => {
  req.logOut();
  res.redirect(`/`);
});

//for phone page render

router.get(`/phone/:id`, (req, res) => {
  Post.find({
      category: req.params.id,


    })
    .populate("category")
    .then(posts => {
      res.render(`home/phone`, {
        posts: posts
      });
    });
});

router.get(`/phone`, (req, res) => {
  Post.find({})
    .populate("category")
    .then(posts => {
      res.render(`home/phone`, {
        posts: posts
      });
    });
});

router.get(`/register`, (req, res) => {
  res.render(`home/register`);
});

router.post(`/register`, (req, res) => {
  let errors = {};
  var userPattren = /^[A-Za-z .]{3,20}$/;
  var useraddress = /^[a-zA-Z0-9\s,.'-]{6,}$/;
  var userphone = /^[0-9]{11}$/;
  var useremail = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  var userpassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

  if (req.body.name) {
    if (!userPattren.test(req.body.name)) {
      errors.name = "Enter Valid Name";
    }
  }

  if (!req.body.name) {
    errors.name = "Name is Required";
  }

  if (!req.body.shopName) {
    errors.shopName = "Shop Name Required";
  }
  if (req.body.shopName.length < 6) {
    errors.shopName = "ShopName Must be atleast 6 Charater";
  }
  if (req.body.phoneNumber) {
    if (!userphone.test(req.body.phoneNumber)) {
      errors.phoneNumber = "Enter Valiad Phone Number With Citycode";
    }
  }
  if (!req.body.phoneNumber) {
    errors.phoneNumber = "Phone Number is Required";
  }
  if (req.body.email) {
    if (!useremail.test(req.body.email)) {
      errors.email = "Email is not Valid";
    }
  }
  if (!req.body.email) {
    errors.email = "Email is Required";
  }
  if (req.body.password) {
    if (!userpassword.test(req.body.password)) {
      errors.password = "Minimum eight characters, at least one letter and one number";
    }

  }

  if (!req.body.password) {
    errors.password = "Password is required";
  }

  if (req.body.address) {
    if (!useraddress.test(req.body.address)) {
      errors.address = "Enter Valid Address";
    }

  }
  if (!req.body.address) {
    errors.address = "Address is Required";
  }
  if (!req.files) {
    errors.file = "Image is Required";
  }
  if (req.body.password) {
    if (!req.body.passwordConfirm) {
      errors.confirm = "Retype your password please";
    }
  }
  if (req.body.password !== req.body.passwordConfirm) {
    errors.confirm = "Password Dont match";
  }
  if (!req.body.long) {
    errors.long = "Longitude Required press Getlocation";
  }
  if (!req.body.lat) {
    errors.lat = "Press Getlocation";
  }
  if (Object.keys(errors).length > 0) { //errors.length > 0
    res.render(`home/register`, {
      errors: errors,
      name: req.body.name,
      shopName: req.body.shopName,
      phoneNumber: req.body.phoneNumber,
      email: req.body.email,
      address: req.body.address,
      long: req.body.long,
      lat: req.body.lat
    });

  } else {
    User.findOne({
      email: req.body.email
    }).then(user => {
      if (user) {
        req.flash(`error_message`, `User already exist, Please login`);
        res.redirect(`/userlogin`);
      } else {
        let filename = "";
        if (!isEmpty(req.files)) {
          let file = req.files.file;
          filename = Date.now() + "-" + file.name;
          file.mv(`./public/uploads/` + filename, err => {
            if (err) throw err;
          });
        }

        const newUser = new User({
          name: req.body.name,
          shopName: req.body.shopName,
          phoneNumber: req.body.phoneNumber,
          email: req.body.email,
          address: req.body.address,
          password: req.body.password,
          long: req.body.long,
          lat: req.body.lat,
          file: filename
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            newUser.password = hash;

            newUser.save().then(userSaved => {
              req.flash(`success_message`, `You are now register please login`);
              res.redirect(`/userlogin`);
            });
          });
        });
      }
    });
  }
});

router.get(`/post/:id`, (req, res) => {
  Post.findOne({
      _id: req.params.id
    }) // post.prices.reverse();
    .populate("category")
    .populate({
      path: `prices`,
      populate: {
        path: `user`,
        models: `users`
      }
    })
    .then(post => {

      let prices = post.prices.sort((p1, p2) => {
        if (p1.prices > p2.prices) {
          return 1;
        } else {
          return -1;
        }
      });
      post.prices = prices;
      res.render(`home/specification`, {
        post: post
      });
    });
});

router.get(`/search`, (req, res) => {

  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), "gi");
    Post.find({
      model: regex
    }).populate("category").then(posts => {
      res.render(`home/phone`, {
        posts: posts
      });
    });
  } else {
    res.redirect(`/`);
  }
});

router.get('/api/get-location/:userId', (req, res) => {
  let id = req.params.userId;
  User.findById(id).select(['lat', 'long', 'shopName', 'address']).then(user => {
    res.json(user);
  }).catch(err => res.status(400).send(err));

});

router.get(`/privacy`, (req, res) => {
  res.render(`home/privacy`);
});

router.get(`/terms`, (req, res) => {
  res.render(`home/terms`);
});


function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}



module.exports = router;