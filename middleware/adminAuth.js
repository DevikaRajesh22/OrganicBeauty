exports.isLoggedIn = async(req,res,next) => {
    try {
        if (req.session.userId) {
            next();
        }else{
            res.redirect('/admin')
        }
    } catch (error) {
        console.log(error.message);
    }
  }
  
  exports.isLoggedOut = async(req, res, next) =>{
    try {
        if (req.session.userId) {
            res.redirect('/admin/landingPage');
        } else {
            next();
        }
    } catch (error) {
        console.log(error.message);
    }
  }