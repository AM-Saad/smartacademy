
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
// const Lecture = require("../models/Lecture");
// const Event = require("../models/Event");
const TakenExam = require("../models/TakenExam");
// const Homework = require("../models/Homework");
// const TakenHomework = require("../models/TakenHomework");
// const Exam = require("../models/Exam");
const Comment = require("../models/Comment");
const Post = require("../models/Post");


exports.search = async (req, res, next) => {
    const query = req.query.q
    var regxValue = new RegExp(query, "i");

    try {
        const teachers = await Teacher.find({ $or: [{ name: regxValue }, { mobile: regxValue }] })
        return res.status(200).json({ message: 'fetched', messageType: 'success', teachers: teachers })
    } catch (err) {
        return res.status(500).json({ message: 'Something went wrong please try again', messageType: 'warning' })
    }
}

exports.comment = async (req, res, next) => {
    const comment = req.body.comment;
    const itemId = req.params.itemId
    let person = req.query.person
    let itemname = req.query.itemname
    const user = req.user
    try {
        const newComment = new Comment({
            by: {
                name: user.name,
                image: user.image,
                id: user._id
            },
            item: itemId,
            comment: comment
        })

        await newComment.save()
        const event = await Post.findById(itemId)
        if (event) {
            event.comments += 1
            await event.save()
        }


        // if (person) {
        //     // const result = await pushNotification({ date: '21-8-20202', to: person, item: itemId, content: `${user.name} commented on your ${itemname}` }, Notifications, user)
        //     // console.log(io.of('/notification'));
        //     // io.broadcast.to(data.toid).emit('notifi',{
        //     //     msg:'hey',
        //     //     name:data.name
        //     // });

        //     io.to('notifications').emit('notifi', 'Hole');

        //     // io.to(person).emit('notifi', { message: 'hola' })
        //     if (itemname === 'event') {
        //         await Teacher.findOneAndUpdate({}, { $inc: { notifications: 1 } })
        //     } else {
        //         await Student.findOneAndUpdate({ _id: person }, { $inc: { notifications: 1 } })
        //     }
        // }
        return res.status(200).json({ message: 'addedd', messageType: 'success', comment: newComment })

    } catch (err) {
        console.log(err);

        return res.status(500).json({ message: 'Somthing went wrong please try again', messageType: 'warning' })
    }
}

exports.getcomments = async (req, res, next) => {
    try {
        const comments = await Comment.find({ item: req.params.itemId })
        return res.status(200).json({ message: 'fetched', messageType: 'success', comments: comments })
    } catch (err) {
        return res.status(500).json({ message: 'Something went wrong please try again', messageType: 'warning' })
    }
}

exports.deleteComment = async (req, res, next) => {
    const itemId = req.params.itemId
    const commentId = req.params.commentId

    try {

        const comment = await Comment.findById(commentId)
        if (!comment.by.id.toString() === req.user._id.toString()) return res.status(401).json({ message: 'You are not allowed to delete this comment', messageType: 'warning' })
        const post = await Post.findById(itemId)
        if (post) {
            post.comments -= 1
            await post.save()
        }
        await comment.remove()
        return res.status(200).json({ message: 'Deleted', messageType: 'success' })

    } catch (error) {
        return res.status(500).json({ message: 'Something went wrong please try again', messageType: 'warning' })

    }
}




exports.index = (req, res, next) => {
    return res.render("public/landing", {
        path: "/home",
        pageTitle: "AlAraby Academy",
        errMessage: null,
        SuccessMessage: null,
        isLoggedIn: req.isLoggedIn,
        isTeacher: req.isTeacher,
        user: req.user

    });
}
exports.aboutUs = (req, res, next) => {
    return res.render("public/about", {
        path: "/about",
        pageTitle: "About us",
        errMessage: null,
        SuccessMessage: null,
        isLoggedIn: req.isLoggedIn,
        isTeacher: req.isTeacher,
        isOwner: false,
        user: req.user
    });
}

exports.contactUs = (req, res, next) => {
    return res.render("public/contact", {
        path: "/contact",
        pageTitle: "Contact us",
        errMessage: null,
        SuccessMessage: null,
        isLoggedIn: req.isLoggedIn,
        isTeacher: req.isTeacher,
        isOwner: false,
        user: req.user


    });
}
exports.postmessage = (req, res, next) => {
    return res.render("public/contact", {
        path: "/contact",
        pageTitle: "Contact us",
        errMessage: null,
        SuccessMessage: null,
        isLoggedIn: req.isLoggedIn,
        isTeacher: req.isTeacher,
        isOwner: false,
        user: req.user
    });
}
exports.locked = (req, res, next) => {
    return res.render("public/lockedaccount", {
        path: "/locked",
        pageTitle: "الحساب غير مفعل",
        errMessage: null,
        SuccessMessage: null,
        isLoggedIn: req.isLoggedIn,
        isTeacher: req.isTeacher,
        isOwner: false,
        user: req.user

    });
}
exports.policy = (req, res, next) => {
    return res.render("public/policy-terms", {
        path: "/policy",
        pageTitle: "Policy and terms",
        errMessage: null,
        SuccessMessage: null,
        isLoggedIn: req.isLoggedIn,
        isTeacher: req.isTeacher,
        isOwner: req.user.isOwner

    });
}


exports.subjects = async (req, res, next) => {
    const student = req.params.student
    return res.render("public/subjects", {
      path: "/subjects",
      pageTitle: "Subjects",
      student: student,
      isTeacher: req.isTeacher,
      isOwner: false,
      isLoggedIn: req.isLoggedIn,
      user: req.user
    });
  }
  