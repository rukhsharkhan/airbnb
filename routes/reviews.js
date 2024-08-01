const express = require("express");
const router = express.Router({mergeParams:true});
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const wrapAsync= require("../utils/wrapAsync.js");
const ExpressError= require("../utils/ExpressError");
const {reviewSchema }=require("../Schema");

const validateReview=(req,res,next)=>{

  const { error } = reviewSchema.validate(req.body);
   console.log(error);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    console.log(errMsg);
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
}



//Review route
//1.post route
router.post("/",validateReview,wrapAsync(async(req,res)=>{
  let listing=await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);

  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  res.redirect(`/listings/${listing._id}`);


}));

//2.delete route
router.delete("/:reviewid",wrapAsync(async(req,res)=>{
let {id, reviewid}=req.params;
await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewid}})
await Review.findByIdAndDelete(reviewid);

res.redirect(`/listings/${id}`);
}))

module.exports = router;