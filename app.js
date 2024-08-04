const express = require("express");
const app = express();
const path = require("path");
const mongoose = require('mongoose');
const methodOverride = require("method-override");
const ExpressError= require("./utils/ExpressError");
const listingsRouter = require("./routes/listing.js")
const reviewsRouter = require("./routes/reviews.js")
const userRouter = require("./routes/user.js")
const ejsMate=require("ejs-mate");
const MONGO_URL="mongodb://127.0.0.1:27017/WanderLust";
const session = require("express-session")
const flash = require("connect-flash")
const passport=require("passport");
const LocalStrategy= require("passport-local");
const User= require("./models/user.js");
main().then(()=>{
  console.log("connected to db");
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine","ejs"); 
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,"public")));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);

const sessionOptions={secret:"mysupersecretstring" ,resave:false,saveUninitialized:true,cookie:{expires:Date.now()+7*60*60*24*1000},maxAge:7*60*60*24*1000,httpOnly:true};

app.get("/",(req,res)=>{
  res.send("Hi i am root");
})


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  next();
})

// app.get("/demouser",async (req,res)=>{
//   let fakeuser = new User({
//     email:"student@gmail.com",
//     username:"Rudhra",
//   })
//   let registeredUser = await User.register(fakeuser,"helloworld");
//   res.send(registeredUser);
// })

//listing Routes
app.use("/listings",listingsRouter);

//Review route
app.use("/listings/:id/review",reviewsRouter);
//user
app.use("/",userRouter);

app.all("*",(req,res,next)=>{
  next(new ExpressError(404,"Page Not Found!!!"))
})

app.use((err,req,res,next)=>{
 let {status=500,message="Something went Wrong!!!"}=err;
 res.status(status).render("error.ejs",{message});
})

app.listen(8080,()=>{
  console.log("app is listening to 8080");
})