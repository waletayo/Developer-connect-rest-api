'use strict';
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const User = require('../../models/User');
const Profile = require('../../models/profile');
const logger = require("../helper/logger");
const Validator = require('validatorjs');
const multer = require('multer');

router.get('/test', (req, res) => {
    res.json({msg: "profile works "})

});
//to check for user profile trough token
//if the user as created a profile
//get current profile
//add it to the dashboard only add education and experirnce ti the ash board page
//personl profile
router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    const errors = {};
    Profile.findOne({user: req.user.id})
        .then(profile => {
            if (!profile) {
                errors.noprofile = "there is no profile for this account";
                return res.status(404).json({
                    status: false,
                    message: errors
                });
            }
            res.json({
                status:true,
                message:"your profile",
                data:{
                    profile:profile
                }
            });
        })
        .catch(err => res.status(404).json(err));
});
//this is the route to get all users profile
router.get('/all', (req, res) => {
    Profile.find()
        .populate('user')
        .then(profiles => {
            if (!profiles) {
                return res.status(404).json({
                    status: false,
                    message: "profile is not available for now "
                });
            }
            res.json({
                status: true,
                data: {
                    profiles: profiles
                }

            });
        }).catch(err => {
        res.status(404).json({
            status: false,
            message: "hoop an error occur"
        });
    })
});


//@Route det/api/profile/handle/:handle;
// get profile by handel
//@ public route this is to access a profile or check the profile by handle
router.get('/handle/:handle', (req, res) => {
    //find the handle in the database {params}
    Profile.findOne({handle: req.params.handle})
        .populate('user')
        .then(profile => {
            if (!profile) {
                res.status(400).json({
                    status:false,
                    message:"fail no profile"
                });

            }
            res.json({
                status:true,
                message:"loading sucessful",
                data:{
                    profile:profile
                }
            });
        })


        .catch(err => {
            logger.log('profile by handle error', err);
            res.status(404).json(err);
        })


});
//get profile by user id
router.get('/user/:user_id', (req, res) => {
    const errors = {};
    Profile.findOne({user: req.params.user_id})
        .populate('user')
        .then(profile => {
            if (!profile) {
                errors.noprofile = 'there  is no profile for ths user';
                res.status(404).json({
                    status:true,
                    message:"invalid id"
                });
            } else {
                res.json({
                    status:true,
                    message:"profile",
                    data:{
                        profile:profile
                    }
                });
            }
        })
        .catch(err => {
            logger.log("profile by id error", err);
            res.status(404).json({profile: "there is no profile for this user"});
        })
});


//this is a post route to update or create or update a user profile
router.post('/', passport.authenticate('jwt',{session:false}), (req, res) => {
    console.log(req.file);
    logger.log("req body:", req.body);


    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.github) profileFields.github = req.body.github;
    if (typeof  req.body.skill !== "undefined") {
        profileFields.skill = req.body.skill.split(',');
    }
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkdin) profileFields.social.linkdin = req.body.linkdin;
    if (req.body.twitter) profileFields.social.twitter = req.body.linkdin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;
    //update the profile
    Profile.findOne({user: req.user.id})
        .then(profile => {
            if (profile) {
                Profile.findOneAndUpdate(
                    {user: req.user.id},
                    {$set: profileFields},
                    {new: true})
                    .then(profile => res.json({
                        status: true,
                        message: "profile created successfully",
                        data:{
                            profile:profile
                        }
                    }));

            }
            else {
                //create profile updater
                //check hamdle
                Profile.findOne({handle: profileFields.handle})
                    .then(profile => {
                        if (profile) {
                            errors.handle = "handle already exist";
                            res.status(400).json({
                                status:false,
                                message :errors
                            });
                        }
                        //save
                        new Profile(profileFields).save().then(profile => res.json({
                            status:true,
                            message:"profile update is successful",
                            data:{
                                profile:profile
                            }
                        }))
                    });

            }
        });


});

//post and this is to add experince
//add exp to profile
router.post('/experience', passport.authenticate('jwt', {session: false}), (req, res) => {


    let reqData = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        description: req.body.description
    };
    let reqRules = {
        title: "required",
        company: "required",
        location: "required",
        from: "required",
        to: "required",
        description: "required",

    };
    let validator = new Validator(reqData, reqRules);
    logger.log("validator pass: ", validator.passes());
    logger.log("validator fails: ", validator.fails());
    logger.log("validator errors: ", validator.errors.all());
    //validation --End


    Profile.findOne({user: req.user.id})
        .then(experience => {
            const newExp = {
                title: req.body.title,
                company: req.body.company,
                location: req.body.location,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }
            //add to profile array list
            experience.experience.unshift(newExp);
            experience.save().then(addexperience => {
                res.json({
                    status:true,
                    message:"experience added successfully",
                    data:{
                        addexperience:addexperience
                    }

                });

            })
        })
});

//this is education api to add education to your profile


router.post('/education', passport.authenticate("jwt", {session: false}), (req, res) => {
    Profile.findOne({user: req.user.id})
        .then(profile => {
            const newEducation = {
                school: req.body.school,
                degree: req.body. degree,
                fieldOfStudy: req.body.fieldOfStudy,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }
            //add to profile array list
            profile.education.unshift(newEducation);
            profile.save().then(profile => {
                res.json({
                    status:true,
                    message:"experience added successfully",
                    data:{
                        profile:profile
                    }

                });


            })
        })
});



















//delete route to delete experince and education


router.delete('/experience/exp_id', passport.authenticate('jwt', {session: false}), (req, res) => {
    Profile.findOne({user: req.user.id}).then(profile => {
        //get remove index
        const removeIndex = profile.experience
            .map(item => item.id)
            .indexOf(req.params.exp_id);

        //splice out of
        profile.experience.splice(removeIndex, 1);
        //save

        profile.save().then(profile => res.json(/*profile*/{
            status:true,
            message:"experience deleted sucessfully",
            data:{
                profile:profile
            }
        }))
            .catch(err => res.status(404).json({delete: "err"}))
    });


});

router.delete('/education/edu_id:', passport.authenticate('jwt', {session: false}), (req, res) => {
    Profile.findOne({user: req.user.id}).then(profile => {
        //get remove index
        const removeIndex = profile.education
            .map(item => item.id)
            .indexOf(req.params.edu_id);

        //splice out of
        profile.education.splice(removeIndex, 1);
        //save

        profile.save().then(profile => res.json(profile))
            .catch(err => res.status(404).json({delete: "err"}))
    });


});

//delete user annd profile
router.delete('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    Profile.findOneAndRemove({user: req.user.id})
        .then(() => {
            User.findOneAndRemove({_id: req.user.id})
                .then(() => res.json({
                    status:true
                }));
        });
});


module.exports = router;
