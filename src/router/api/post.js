const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport/lib');
const Post = require("../../models/post");
const Validator = require('validatorjs');
const Profile = require("../../models/profile");
const logger = require('../helper/logger');

router.get("/test", (req, res) => {
    res.json({msg: 'post works '});

});

//to get all post
router.get('/', (req, res) => {
    Post.find()
    //get post in Asending order
        .sort({date: -1})
        .populate('user')
        .then(posts => res.json(posts))
        .catch(err => res.status(404).json({
            status: "false",
            message: "error no post found"
        }))
});

//get post by id
router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
        .sort({date: -1})
        .then(post => {
            res.json(post)
        })
        .catch(err => {
            res.status(404).json({
                status: "false",
                message: "no post for this id"
            });
        });

})

//post route for posting
//create post
//private
router.post('/', passport.authenticate("jwt", {session: false}), (req, res) => {

    let reqData = {
        text: req.body.text
    };
    let reqRules = {
        text: "required"


    };
    let validator = new Validator(reqData, reqRules);
    logger.log("validator pass: ", validator.passes());

    logger.log("validator fails: ", validator.fails());

    logger.log("validator errors: ", validator.errors.all());
    //validation --End
    const newPost = new Post({
        text: req.body.text,
        user: req.body.user
    });
    newPost.save()
        .then(post => {
            res.json({
                status: true,
                message: "post created successfully",
                data: {
                    post: post
                }
            });

        })
    .catch(err=>{
        res.json({
            status:false,
            message :"creation of post not successful",
            data:{
                err:err
            }
        })
    })

});

//delete post
router.delete('/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    Profile.findOne({user: req.user.id})
        .then(profile => {
            Post.findOne(req.params.id)
                .then(post => {
                    //check owner corrrect
                    if (post.user.toString() !== req.user.id) {
                        res.status(401).json({
                            status: "false",
                            message: "Unauthorize"
                        })
                    } else {
                        post.remove().then(() => res.json({sucess: true}))
                    }
                })
                .catch(err => {
                    res.status(404).json({error: "no post to delete"});
                })
        })
});


////likes and unlike
router.post('/like/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    Profile.findOne({user: req.user.id})
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
                        return res.json({
                            status:false,
                            message:"post already liked"
                        })
                    }

                    post.likes.unshift({user: req.user.id});
                    post.save().then(post => {
                        res.json({
                            status:true,
                            message:"liked post successful",
                            data:{
                                post:post
                            }
                        })
                    })
                })

                .catch(err => {
                    res.status(404).json({err: "cant like post error"});
                    logger.log("like post error", err);
                })
        })
});

//unlike route
router.post('/unlike/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    Profile.findOne({user: req.user.id})
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
                        return res.status(400).json({notLiked: "you have not yet like this post"})
                    }
                    //remove like
                    const removeIndex = post.likes
                        .map(item => item.user.id);
                    //splice out of array
                    post.likes.splice(removeIndex);
                    post.save().then(post => {
                        res.json(post);
                    })
                })
        })

        .catch(err => {
            res.status(404).json({err: "cant like post error"});
            logger.log("like post error", err);
        })
});

router.post('/comment/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    let reqData = {
        text: req.body.text
    };
    let reqRules = {
        text: "required"


    };
    let validator = new Validator(reqData, reqRules);
    logger.log("validator pass: ", validator.passes());

    logger.log("validator fails: ", validator.fails());

    logger.log("validator errors: ", validator.errors.all());
    //validation --End

    Post.findById(req.params.id)
        .then(post => {
            const newComment = {
                text: req.body.text,
                name: req.body.name,
                avatar: req.body.avatar,
                user: req.user.id
            }
            //add to comment array
            post.comments.unshift(newComment);
            post.save().then(post => {
                res.json(post)
            })
                .catch(err => {
                    res.status(400).json({err: "error in comment"})
                });


        });

});


router.delete('/comment/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    let reqData = {
        text: req.body.text
    };
    let reqRules = {
        text: "required"


    };
    let validator = new Validator(reqData, reqRules);
    logger.log("validator pass: ", validator.passes());

    logger.log("validator fails: ", validator.fails());

    logger.log("validator errors: ", validator.errors.all());
    //validation --End

    Post.findById(req.params.id)
        .then(post => {
            if (post.comment.filter(comment => comment._id.toString() === req.params_comment_id).length == 0) {

                return res.status(404).json({comment: "comment doesnt exsit"});
            }

            //get remove index
            const removeIndex = post.comments
                .map(item => item_id.toString())
                .indexOf(req.params.comment.id);
            //sliping out of array
            post.comments.splice(removeIndex, 1);
            post.save().then(post => {
                res.json(post);
            })

        })
        .catch(err => {
            res.status(400).json({err: "error in comment"})
        });


});


module.exports = router;
