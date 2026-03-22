const mongoose = require("mongoose");
const Review = require("./review.js");
const { ref } = require("joi");
const Schema = mongoose.Schema;

// const listingSchema = new Schema({
//   title: {
//     type: String,
//     required: true,
//   },
//   description: String,
//   image: {
//     type: String,
    //   Image exist nhi kare tou ye bhej do
    // default: "https://pixabay.com/photos/duck-nature-bird-waterfowl-plumage-9868154/",
    //   image tou h but wo link exist nhi karti h
//     set: (v) => v === "" ? "https://pixabay.com/photos/duck-nature-bird-waterfowl-plumage-9868154/"
//       : v
//   },
//   price: Number,
//   location: String,
//   country: String
// });

// Again create new Schema for initializing database
const listingSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: {
    filename: String,
    url: String,
  },
  price: Number,
  location: String,
  country: String,
  //reference of review as the relation is 1 to many
  //hamne listing schema ke andar Review ko add kardiya
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

listingSchema.post("findOneAndDelete",async(listing)=>{
  if(listing) {
  await Review.deleteMany({_id : {$in: listing.reviews}})
  }
});



// Using the above Schema we are creating the model
const Listing = mongoose.model("Listing", listingSchema);

//now export this model
module.exports = Listing;