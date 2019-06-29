'use strict';
const mongoose= require('mongoose');
const Schema=mongoose.Schema;

const UserSchema=new Schema({
    //name,emai,pass,avatar,date:{
        name:{
            type:String,
            require:[true,"name is required"]
        },
        email:{
            type:String,
            require:[true,"field must not be empty"]
        },
        password:{
            type:String,
            require:true
        },
        avatar:{
            type:String,
            required:true
        },
        date:{
            type:Date,
            default:Date.now
        },

});
       

const  User = mongoose.model('users', UserSchema);
module.exports=User;
