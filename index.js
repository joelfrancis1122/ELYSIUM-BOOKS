const mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/ElysiumProject')
const nocache = require('nocache');





const userRoute=require('./routes/userRoute')  
const adminRoute = require('./routes/adminRoute')     

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
app.use(express.json())
app.set("view engine", "ejs");

app.use(
  session({
    secret: "12dwvgjad234",
    resave: false,
    saveUninitialized: true,

  })
);

app.use("/", userRoute);
app.use("/admin", adminRoute);
app.use('*',(req,res)=>{
res.render('users/404')
 })






app.listen(PORT, () => {
  console.log("Server started on http://localhost:5000");
});
