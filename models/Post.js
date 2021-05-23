const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const postSchema = new Schema({

    posttype: String, // public Or Privte
    content: String,
    image: String,
    file: String,
    group: String,
    grade: String,
    date: String,
    comments: Number,
    attachedlink: String,
    timeRange: {
        from: String,
        to: String
    },
    teacher: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'teacher'
    }

});


module.exports = mongoose.model("Post", postSchema);
