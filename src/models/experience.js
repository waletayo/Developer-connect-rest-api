const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const experienceSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },

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

}, {timestamp: true});
const experience = mongoose.model("experience", experienceSchema, "experience");
module.exports = experience;
