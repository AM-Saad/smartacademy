const mongoose = require("mongoose");
var ms = require("ms")

const Schema = mongoose.Schema;
const lessonSchema = new Schema({
  //Exprire After 1 hr  
  createdAt: { type: Date, default: null },
  classroom: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  term: {
    type: Number,
    required: true
  },
  unit: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Unit'
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  lessonNo: {
    type: Number,
    required: true
  },
  modelAnswers: [{
    fileTitle: String,
    fileName: String
  }],
  pdfs: [{
    fileTitle: String,
    fileName: String
  }],
  videos: [{
    title: String,
    path: String
  }],
  exams: [{
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'exam'
  }],
  homeworks: [{
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Homework'
  }],
  live_sessions: [{
    title: String,
    path: String
  }],
  pin: String,
  locked: Boolean,
  teacher: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'teacher'

  },
  students: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Student',
    }],
});

module.exports = mongoose.model("Lesson", lessonSchema);
