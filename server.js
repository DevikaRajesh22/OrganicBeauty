const express=require('express');
const path=require('path');
const userRoute=require('./routes/userRoute');
const adminRoute=require('./routes/adminRoute');
const port=process.env.PORT || 3000;

const app=express();

//for mongodb atlas
// const mongoose=require('mongoose');
// const uri = 'mongodb+srv://devikarajesh:O169hz7q1cj2Df9r@Organic.mongodb.net/<databasename>?retryWrites=true&w=majority';
// mongoose.connect(uri, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   });
//   const db = mongoose.connection;
//   db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// db.once('open', () => {
//   console.log('Connected to MongoDB Atlas');
// });


//static
app.use(express.static(path.join(__dirname, "public")));

//routes
app.use('/',userRoute);
app.use('/admin', adminRoute);

app.listen(port,()=>{
    console.log("server is running");
});

module.exports=app;

