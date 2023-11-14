const User = require("../models/user/userCollection");
exports.isLoggedIn = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const user = await User.findOne({ _id: userId });
    if (req.session.name) {
      if (user.isBlocked) {
        req.session.destroy();
        res.redirect("/login");
      } else {
        next();
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

exports.isLoggedOut = async (req, res, next) => {
  try {
    if (req.session.userId) {
      res.redirect("/");
    } else {
      next();
    }
  } catch (error) {
    console.log(error.message);
  }
};
