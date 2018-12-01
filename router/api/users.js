'use strict';
const express = require("express");
const router = express.Router();
const sendGrid = require('.././helper/mailler');
const User = require("../../models/User");
const logger = require("../helper/logger");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");
const Validator = require('validatorjs');
const validateRegisterInput = require('../../validator/register');
const validateLoginInput = require('../../validator/login');
router.get("/test", (req, res) => {
    res.json({msg: "user works "});
});

//register route
router.post("/register", (req, res) => {
    const {errors, isValid} = validateRegisterInput(req.body);
    if (!isValid) {
        return res.status(400).json(errors)
    }


    User.findOne({email: req.body.email}).then(user => {
        if (user) {
            logger.log("Account Created:", Date.now, user);
            return res.status(400).json({
                status:false,
                message:"email already exist",
                code:400
            });
        } else {
            const avatar = gravatar.url(req.body.email, {
                s: "200",
                r: "pg",
                d: "mm"
            });

            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                avatar: avatar,
                password: req.body.password
            });
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    // if(err) throw err;
                    newUser.password = hash;
                    newUser
                        .save()
                        .then(user => {
                            let sendEmail = sendGrid.sendMail("no-reply@deveconnector.com", user.email, "Welcome Email",
                                "Hello " + user.name + " \n" +
                                "Welcome to deveconnector we are so excited to see you on our platfom, please click the link below to" +
                                "verify your email http://localhost:9000/api/users/verify-email/alclmalalmas334929e . Thanks " +
                                "");

                            if (sendEmail) {
                                logger.log("send email success", sendEmail);
                            } else {
                                logger.log("send email failed", sendEmail);
                            }
                            logger.log("user:", user);
                            res.json({
                                status:true,
                                message:"signup successful",
                                data:user
                            });
                        })
                        .catch(err => {
                            logger.log("password encrypt:", err);
                        });
                });
            });
        }
    });
});
//user login route
router.post("/login", (req, res) => {

    const {errors, isValid} = validateLoginInput(req.body);
    if (!isValid) {
        return res.status(400).json(errors)
    }


    //checking user by email
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({email}).then(user => {
        if (!user) {
            return res.status(400).json({email: "User not found"});
        }
        bcrypt.compare(password, user.password).then(isMatch => {
            if (isMatch) {
                // res.json({ msg: "sucess" });
                const payload = {id: user.id, name: user.name, avatar: user.avatar}; //create payload

                //signtoken
                jwt.sign(payload, "keys", {expiresIn: 3600}, (error, token) => {
                    logger.log("jwt err:", error);
                    res.json({
                        status: true,
                        success:true,
                        message: "Login Successfully",
                        data: {
                            token: "Bearer " + token,
                            user: user
                        }
                    });
                });
            } else {
                return res.status(400).json({
                    status : false,
                    message: "Invalid email or password",
                });
            }
        });
    });
});

//current user
router.get(
    "/current",
    passport.authenticate("jwt", {session: false}),
    (req, res) => {
        res.json(
            {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email
            }
        );
    }
);

module.exports = router;