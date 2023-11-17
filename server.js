const express = require("express");
const path = require("path");
const userRoute = require("./routes/userRoute");
const adminRoute = require("./routes/adminRoute");
const port = process.env.PORT || 3000;
const session = require("express-session");
const nocache = require("nocache");
const crypto = require("crypto");

const app = express();

const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://Devika:1234@cluster0.dr4suum.mongodb.net/OrganicBeauty?retryWrites=true&w=majority");

//configure express session
const secretKey = crypto.randomBytes(32).toString("hex");
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
  })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//static
app.use(express.static(path.join(__dirname, "public")));
app.use(nocache());

//routes
app.use("/", userRoute);
app.use("/admin", adminRoute);
app.use((req, res) => {
  res.status(404).render("user/error"); // Assuming 'user/error' is your error page
});

app.listen(port, () => {
  console.log("server is running");
});

module.exports = app;
