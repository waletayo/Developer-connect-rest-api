'use strict';
const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const gravatar = require("gravatar");
const passport = require("passport");

const app = express();
//
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
//pointing to floder or route
const users = require("./router/api/users");
const profile = require("./router/api/profile");
const post = require("./router/api/post");

const logger = require("./router/helper/logger");

//Database configuration
const DB = require("./config/keys").mongoURI;
//connect to mongo db
mongoose
    .connect(DB)
  .then(() => {
    // console.log("connection to DataBase sucessfull")
    logger.log("mongoose:", "connection to DataBase sucessfull");
  })
  .catch(err => console.log(err));
//passport middle
app.use(passport.initialize());


app.use(function (req, res, next) {

    res.header("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Authorization,x-api-key");
    next();
});







//pass config
require("./config/passport")(passport);
//use route
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/post", post);



//app.get("/",(req,res)=>(res.send('hello world')));
const port = process.env.PORT || 3000;
app.listen(port, logger.log("Dev-connector server is running on ", port));
