const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const takenExamSchema = new Schema({
    examType:String,
    lesson: {
        type: Schema.Types.ObjectId,
        ref: 'Lesson',
    },
    examId: {
        type: Schema.Types.ObjectId,
        ref: 'Exam',
    },
    teacher: {
        type: Schema.Types.ObjectId,
        ref: 'Teacher',
    },
    student: {
        type: Schema.Types.ObjectId,
        ref: 'Student',
    },
    subject: String,
    lessonQuestions: [
        {
            question: String,
            questionType: String,
            questionImg: String,
            questionScore: Number,
            answers: [
                {
                    answerNo: Number,
                    answer: String
                }
            ],
            selectedAnswer: {
                type: Object
            },
            correctAnswer: Number,
            point: Number,
            note: '',
        }
    ],
    totalScore: Number,
    duration: {
        min: String,
        started: String,
        ended: String,
    },
    takenAt: String,

    classroom: String,
    name: String

}, { timestamps: true })

module.exports = mongoose.model("TakenExam", takenExamSchema);
