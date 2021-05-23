const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const assistentSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    section: {
        type: String,
    },
    mobile: {
        type: String,
        required: true
    },
    isTeacher: {

        type: Boolean,
        default: false
    },
    isAssistent: {
        type: Boolean,
        default: true
    },
    blocked: {
        type: Boolean,
        default: false
    },

    teacher: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'teacher'
    },
    image: String
});

module.exports = mongoose.model("assistent", assistentSchema);
