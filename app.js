if(process.env.NODE_ENV != "production") {
require('dotenv').config() 

}
const isProduction = process.env.NODE_ENV === "production";
// console.log(process.env.SECRET)

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const ejsMate = require('ejs-mate');
let port = 8080;

const ExpressError = require("./utils/ExpressError.js");

const session = require("express-session");
const MongoStore = require('connect-mongo').default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// const ejs = require("ejs");
const path = require("path"); 

//require method-override
const methodOverride = require("method-override");
app.engine("ejs",ejsMate);

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL;
main().then(()=>{
    console.log("connected to DB");
})
.catch(err=>{
    console.log(err);
});

async function main() {
    await mongoose.connect(dbUrl);
}

//setting up path for views directory for rendering to ejs file
app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"));



//taki hamara sara data jo request me aaraha h wo parse ho paye
app.use(express.urlencoded({extended:true}));

app.use(methodOverride("_method"));

app.engine("ejs",ejsMate);

//for using static file located in public folder
app.use(express.static(path.join(__dirname,"/public")));

const store = MongoStore.create({
    mongoUrl:dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600,
});

store.on("error" ,(err) => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

app.set("trust proxy", 1);

//making session
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly: true,
        secure: isProduction,  
         sameSite: "lax"
    }
};

// app.get("/",(req,res)=>{
//     res.send("HI, i am root");
// });



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=> {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

// app.get("/demouser",async(req,res) =>{
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student",
//     });

//     let registeredUser = await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
// });

//writing /listings routes
app.use("/listings",listingRouter);

//writing all /reviews routes
app.use("/listings/:id/reviews",reviewRouter);

app.use("/",userRouter);

// app.get("/testListing", async (req,res)=>{
//     let sampleListing = new Listing({
//         title: "My new Villa",
//         description: "BY the Beach",
//         price: 1200,
//         location: "Calcata",
//         country: "India"
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });

//for any undefined route if request come then this error will get display on the webpage
app.all(/.*/, (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// Error handling middleware
app.use((err,req,res,next)=>{
    // res.send("Something went wrong!");
    let{ statusCode = 500,message = "Something went wrong!"} = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs",{message});
});

app.listen({port},()=>{
    console.log(`server is listening on the port = ${port}`);
});