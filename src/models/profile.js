'use strict'
const mongoose=require('mongoose');
const Schema=mongoose.Schema;

//create Schema
const ProfileSchema=new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:'users'
    },
    handle:{
        type: String,
        required:true,
        max:40
    },
    company:{
        type:String,
        required:true

    },
    website:{
        type:String,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    status:{
        type:String,
        required:true

    },
    skill:{
        type:[String],
        required:true

    },
    bio:{
        type:String,
        required:true
    },
    github:{
        type:String,
        required:true
    },
    experience:[
        {

            title: {
                type: String,
                required: true


            },
            company: {
                type: String,
                required: true


            },
            location: {
                type: String,
                required: true

            },
            from: {
                type: String,
                required: true


            },
            to: {
                type: String,
                required: true
            },
            current: {
                type: Boolean,
                required: false


            },
            description: {
                type: String,
                required: true


            }
        }
    ],
    education:[
        {
            school:{
                type:String,
                required:true


            },
            degree:{
                type:String,

            },
            fieldOfStudy: {
                type:String,
            },
            from:{
                type:String,

            },
            to:{
                type:String,

            },
            current:{
                type:Boolean,
                required:false


            },
            description:{
                type:String,


            }


        }
    ],

    social:{
        youtube:{
            type:String
        },
        twitter:{
            type:String
        },
        facebook :{
            type:String,
            required:true
        },
        linkdin:{
            type:String
        },
        instagram:{
            type:String
        },
        date:{
            type:Date,
            default:Date.now
        }
    }


});

const profile = mongoose.model('profile', ProfileSchema);
module.exports=profile;
