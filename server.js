const express=require('express');
const path=require('path');
const userRoute=require('./routes/userRoute');
const adminRoute=require('./routes/adminRoute');
const port=process.env.PORT || 3000;
const session=require('express-session');
const nocache=require('nocache');
const crypto = require('crypto');

const app=express();

const mongoose=require('mongoose');
mongoose.connect('mongodb://127.0.0.1/OrganicBeauty');

//configure express session
const secretKey = crypto.randomBytes(32).toString('hex');
app.use(express.urlencoded({ extended: true }));
app.use(
session({
  secret: secretKey,
  resave: false,
  saveUninitialized: true,
}));

//static
app.use(express.static(path.join(__dirname, "public")));
app.use(nocache());

//routes
app.use('/',userRoute);
app.use('/admin', adminRoute);

app.listen(port,()=>{
    console.log("server is running");
});

module.exports=app;

