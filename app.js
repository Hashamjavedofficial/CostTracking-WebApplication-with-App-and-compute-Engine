const express = require(`express`); //express framwork
const app = express();
const path = require(`path`);
const exphbs = require("express-handlebars");
const mongoose = require(`mongoose`);
const bodyParser = require(`body-parser`);
const methodOverride = require(`method-override`);
const upload = require(`express-fileupload`);
const session = require(`express-session`);
const flash = require(`connect-flash`);
const {
  mongoDbUrl
} = require(`./config/database`);
const passport = require(`passport`);

mongoose.Promise = global.Promise;

//connect database

mongoose
  .connect(mongoDbUrl, {
    useNewUrlParser: true
  })
  .then(db => {
    console.log(`connected to database`);
  })
  .catch(err => {
    console.log(err);
  });
//bringing helper functions

const {
  select,
  generateTime
} = require(`./helpers/handlebars-helpers`);

//setting view engine

app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "home",
    helpers: {
      select: select,
      generateTime: generateTime
    }
  })
);
app.set("view engine", "handlebars");

// for static data
app.use(express.static(path.join(__dirname, "public")));

// upload middleware for upload data

app.use(upload());

//using body parser
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

//Method override
app.use(methodOverride(`_method`));

//flash message and session
app.use(
  session({
    secret: "hashamjaved",
    resave: true,
    saveUninitialized: true
  })
);

app.use(flash());

//Passport Initializer
app.use(passport.initialize());
app.use(passport.session());

//Flash Messages

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.success_message = req.flash(`success_message`);
  res.locals.error_message = req.flash(`error_message`);
  res.locals.error = req.flash(`error`);
  next();
});

//executing routes

const home = require(`./routes/home/index`);
const admin = require(`./routes/admin/index`);
const posts = require(`./routes/admin/posts`);
const categories = require(`./routes/admin/categories`);
const users = require(`./routes/admin/users`);
const prices = require(`./routes/admin/prices`);

//for useradmins routes

const useradmins = require(`./routes/useradmins/index`);
const post = require(`./routes/useradmins/post`);

//load routes

app.use("/", home);
app.use("/admin", admin);
app.use("/admin/posts", posts);
app.use("/admin/categories", categories);
app.use("/admin/users", users);
app.use("/admin/prices", prices);

//user admin routes execution

app.use("/useradmins", useradmins);
app.use("/useradmins/post", post);

//created port and server

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`App running on port ${port}`));