const express = require("express");
const app = express();

const Listing = require("./models/listing.js");
const path = require("path");
const mongoose = require('mongoose');
const methodOverride = require("method-override");
const wrapAsync= require("./utils/wrapAsync.js");
const ExpressError= require("./utils/ExpressError.js");
const { listingSchema }=require("./Schema.js");

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


const validateListing=(req,res,next)=>{
  let {error} = listingSchema.validate(req.body);

  if(error){
    let errMsg=error.details.map((el)=>el.message).join(",");
    throw new ExpressError(400,errMsg);
  }else{
    next();
  }
}

app.get("/",(req,res)=>{
  res.send("Hi i am root");
})

//index route
app.get("/listings", wrapAsync(async (req,res)=>{
  const allListings= await Listing.find({});
  res.render("./listings/index.ejs",{allListings});
}))

//new route
app.get("/listings/new",(req,res)=>{
  res.render("./listings/new.ejs")
})

//create rout
app.post("/listings",validateListing,wrapAsync( async (req,res,next)=>{

 let newlisting =  new Listing(req.body.listing);
 await newlisting.save();
 res.redirect("/listings") 
 
}));


//show route
app.get("/listings/:id",wrapAsync(async (req,res)=>{
  const {id}=req.params;
  const listing= await Listing.findById(id);
  res.render("./listings/show.ejs",{listing});
}))
//Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("./listings/edit.ejs", { listing });
}));

//Update Route
app.put("/listings/:id",validateListing, wrapAsync(async (req, res) => {
 
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
}));

//Delete Route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
 
  res.redirect("/listings");
}));

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