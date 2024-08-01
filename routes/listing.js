const express = require("express");
const router = express.Router();

const Listing = require("../models/listing.js");
const wrapAsync= require("../utils/wrapAsync.js");
const ExpressError= require("../utils/ExpressError");
const { listingSchema }=require("../Schema");

const validateListing=(req,res,next)=>{
  let {error} = listingSchema.validate(req.body);

  if(error){
    let errMsg=error.details.map((el)=>el.message).join(",");
    throw new ExpressError(400,errMsg);
  }else{
    next();
  }
}

//index route
router.get("/", wrapAsync(async (req,res)=>{
  const allListings= await Listing.find({});
  res.render("./listings/index.ejs",{allListings});
}))

//new route
router.get("/new",(req,res)=>{
  res.render("./listings/new.ejs")
})

//create rout
router.post("/",validateListing,wrapAsync( async (req,res,next)=>{

 let newlisting =  new Listing(req.body.listing);
 await newlisting.save();
 res.redirect("/listings") 
 
}));


//show route
router.get("/:id",wrapAsync(async (req,res)=>{
  const {id}=req.params;
  const listing= await Listing.findById(id).populate('reviews'); ;
  res.render("./listings/show.ejs",{listing});
}))
//Edit Route
router.get("/:id/edit", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("./listings/edit.ejs", { listing });
}));

//Update Route
router.put("/:id",validateListing, wrapAsync(async (req, res) => {
 
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
}));

//Delete Route
router.delete("/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
 
  res.redirect("/listings");
}));

module.exports = router;