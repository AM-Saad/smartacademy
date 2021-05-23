const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const teacherSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
    },
    password: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: 'images/teacher.svg'
    },
    bio: { type: String, default: 'اهلا بكم في صفحتي الشخصيه' },
    governorate: String,
    students:
        [
            {
                type: Schema.Types.ObjectId,
                ref: 'Student',
                required: true
            }
        ],
    exams: [{
        type: Schema.Types.ObjectId,
        ref: 'exam',
        required: true
    }],

    subject: {
        type: String,
        required: true
    },
    classes: [{ ar: String, en: String }],
    membership: {
        type: Number,
    },
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    }],
    centers: [{ type: String }],
    stars: [
        {
            type: Schema.Types.ObjectId,
            ref: 'student',
            required: true
        }
    ],
    isTeacher: {
        type: Boolean,
        default: true
    },
    
    isOwner: {
        type: Boolean,
        default: false
    },
    
    active: {
        type: Boolean,
        default: false
    },
    social:{
        facebook:String,
        twitter:String,
        youtube:String
    }
});

module.exports = mongoose.model("Teacher", teacherSchema);
