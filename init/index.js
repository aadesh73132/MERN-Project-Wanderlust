const mongoose = require("mongoose");
const data = require("./data.js");
const Listing = require("../models/listing.js");

main()
.then(()=>{
    console.log("connected to DB");
})
.catch((err)=>{
    console.log(err);
});
async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

const initDB = async () => {
    await Listing.deleteMany({});
    data.data = data.data.map((obj)=>({
        ...obj,owner:"698d6c95a102f421ff5a636b"
    }));
    await Listing.insertMany(data.data);
    console.log("data was initialized");
} ;

initDB();