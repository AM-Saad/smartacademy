const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const studentSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true
  },
  classroom: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: 'images/student.svg'
  },
  parentNo: {
    type: String,
  },
  governorate: { type: String },
  school: {
    type: String,
  },
  teachers: [
    {
      teacherId: {
        type: Schema.Types.ObjectId,
        ref: 'teacher',
        required: true
      },
      center: {
        type: String,
      },
      active: Boolean,
      attendance: [{
        sessionId: {
          type: Schema.Types.ObjectId,
          ref: 'Session',
        },
        number: Number,
        date: String,
        center: String,
      }],
    }
  ],
  isStudent: {
    type: Boolean,
    default: true
  },
  lessons: [{
    type: Schema.Types.ObjectId,
    ref: 'Lesson',
  }],
  exams: [
    {
      originalExam: Schema.Types.ObjectId,
      exam: Schema.Types.ObjectId,
    }
  ],
  homeworks: [
    {
      originalHomework: Schema.Types.ObjectId,
      exam: Schema.Types.ObjectId,
    }
  ],
active:{
  type: Boolean,
  default: true
}
},
  { timestamps: true }

);

module.exports = mongoose.model("Student", studentSchema);
