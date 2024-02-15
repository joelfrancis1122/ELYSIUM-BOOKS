const mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/ElysiumProject')
const nocache = require('nocache');





const user_Route=require('./routes/userRoute')  
const admin_Route = require('./routes/adminRoute')     

const express = require('express')
const app = express();

const path = require('path')
const bcrypt = require('bcrypt')
const session = require("express-session");
const { log } = require("console");

const PORT  = 5000

app.use("/public", express.static(path.join(__dirname, "public")));

app.use(nocache());

app.use(express.urlencoded({ extended: true })); 
app.set("view engine", "ejs");

app.use(
  session({
    secret: "12dwvgjad234",
    resave: false,
    saveUninitialized: true,

  })
);

app.use("/", user_Route);
app.use("/admin", admin_Route);


// app.use("/admin", admin_Route);



app.listen(PORT, () => {
  console.log("Server started on http://localhost:5000");
});
