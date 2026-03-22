const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn ,isOwner,validateListing} = require("../middleware.js");

const listingController = require("../controllers/listings.js");
const multer  = require('multer')
const {storage} =require("../cloudConfig.js");
const upload = multer({ storage })

router.route("/")
.get(wrapAsync(listingController.index))
.post( 
    isLoggedIn, 
   
    upload.single("listing[image]"),
     validateListing, 
    wrapAsync(listingController.createListing));


//get = > New route
router.get("/new", isLoggedIn ,listingController.renderNewForm);

router.route("/:id")
.get(wrapAsync(listingController.renderparticularListing))
.put(
     isLoggedIn, 
     isOwner,
     upload.single("listing[image]"),
     validateListing, 
     wrapAsync(listingController.renderUpdateForm))
.delete( 
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.deleteListing));

//Edit route using get request
router.get("/:id/edit"
    ,isLoggedIn
    ,isOwner,
    wrapAsync(listingController.renderEditPage));


module.exports = router;