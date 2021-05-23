const mongoose = require("mongoose");
var ms = require("ms")
const Schema = mongoose.Schema;

const unitSchema = new Schema({
    unitInfo: {
        section: {
            type: String,
        },
        subject: {
            type: String,
            required: true
        },
        classroom: {
            type: String,
            required: true
        },
        term: {
            type: Number,
            required: true
        },
    },
    unitDetails: {
        number: { type: Number, required: true },
        name: { type: String, required: true },
        image: { type: String }
    },
    teacher: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'teacher'
    },
    lessons: [{
        type: Schema.Types.ObjectId,
        ref: 'Lesson'
    }],


});


module.exports = mongoose.model("Unit", unitSchema);