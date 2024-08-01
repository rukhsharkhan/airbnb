const express = require("express");
const app = express();
const path = require("path");
const mongoose = require('mongoose');
const methodOverride = require("method-override");
const ExpressError= require("./utils/ExpressError");
const listings = require("./routes/listing.js")
const reviews = require("./routes/reviews.js")
const ejsMate=require("ejs-mate");
const MONGO_URL="mongodb://127.0.0.1:27017/WanderLust";

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

app.get("/",(req,res)=>{
  res.send("Hi i am root");
})

//listing Routes
app.use("/listings",listings);

//Review route
app.use("/listings/:id/review",reviews);

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