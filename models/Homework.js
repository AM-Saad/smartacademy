const mongoose = require("mongoose");
var ms = require("ms")

const Schema = mongoose.Schema;

const homeworkSchema = new Schema({
    //Exprire After 1 hr  
    timer: Number,
    name: String,
    teacher:{
        type: Schema.Types.ObjectId,
        ref: 'Teacher',
    },
    subject: String,
    classroom: String,
    allQuestions: [
        {
            question: String,
            questionImg: String,
            questionType: String,
            questionScore: Number,
            answers: [
                { answer: String, answerNo: Number },
                { answer: String, answerNo: Number },
                { answer: String, answerNo: Number },
                { answer: String, answerNo: Number }
            ],
            correctAnswer: Number
        }
    ],

});

module.exports = mongoose.model("Homework", homeworkSchema);
