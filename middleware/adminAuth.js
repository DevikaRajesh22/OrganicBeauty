exports.isLoggedIn = async (req, res, next) => {
  try {
    if (req.session.admin) {
      next();
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
  }
};

exports.isLoggedOut = async (req, res, next) => {
  try {
    if (req.session.admin) {
      res.redirect("/admin/landing");
    } else {
      next();
    }
  } catch (error) {
    console.log(error.message);
  }
};
