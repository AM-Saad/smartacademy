
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const multer = require('multer');
const uuidv4 = require('uuid/v4') //for Multer
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const fs = require("fs");
const util = require("util");
const flash = require("connect-flash");
const errorController = require("./controllers/error");
const helmet = require('helmet');
const compression = require('compression');
const app = express();


// const store = new MongoDBStore({
//   uri: "mongodb://tchgzns_admin:zuOW5Xir@serv01.teachingzones.com:27017",
//   databaseName: 'tchgzns_Main',
//   collection: "sessions"
// },
//   function (error) {
//     console.log(error);
//   })

const MONGODBURI = `mongodb+srv://abdelrhman:ingodwetrust@edu-apps.uodvh.mongodb.net/smartacd?retryWrites=true&w=majority`;

const store = new MongoDBStore({
    uri: MONGODBURI,
    collection: "sessions"
});



// const csrfProtection = csrf();



const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {

            cb(null, 'pdf');
        } else {

            cb(null, 'images');
        }
    },
    filename: (req, file, cb) => {
        console.log(file);
        if (file.mimetype === 'application/pdf') {

            cb(null, file.originalname) //Appending .jpg
        } else {

            cb(null, uuidv4())
        }
    }
});


const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'application/pdf'
    ) {
        cb(null, true)
    } else {
        cb(null, false)
    }
};

app.set("view engine", "ejs");
app.set("views", "views");

const authRoutes = require("./routes/auth");
const teacherRoutes = require("./routes/teacher");
const studentRoutes = require("./routes/student");
const adminRoutes = require("./routes/admin");
const publicRoutes = require("./routes/public");

app.use(helmet());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: imageStorage, fileFilter: fileFilter }).single('image'));
// app.use(multer({ storage: filesStorage }).single('file'));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/videos', express.static(path.join(__dirname, 'videos')));
app.use('/pdf', express.static(path.join(__dirname, 'pdf')));

// app.use('/files', express.static(path.join(__dirname, 'files')));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, application/json");
    next();
});


app.use(session({ secret: "my secret", resave: false, saveUninitialized: false, store: store }));
app.use(flash());

app.use((req, res, next) => {
    if (req.session.user) {
        req.isLoggedIn = req.session.isLoggedIn
        req.user = req.session.user
        req.isTeacher = req.session.user.isTeacher
    }
    return next();
});



app.use(authRoutes);
app.use("/admin", adminRoutes);
app.use("/public", publicRoutes);
app.use("/teacher", teacherRoutes);
app.use(studentRoutes);
app.get('/500', errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
    console.log(error)
    return res.status(500).render("500", {
        pageTitle: "Error!",
        path: "/500",
    });
});




mongoose
    .connect(MONGODBURI)
    .then(result => {
        console.log('connected')
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);

    });

const port = process.env.PORT || 3000;
    
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});