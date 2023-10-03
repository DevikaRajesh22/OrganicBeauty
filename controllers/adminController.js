//loginGet for GET request
exports.loginGet=async(req,res)=>{
    try{
        res.render('admin/adminLogin');
    }catch(error){
        res.render('admin/error');
        console.log(error.message);
    }
};

//loginPost for POST request
exports.loginPost=async(req,res)=>{
    try{
        res.render('admin/landingPage');
    }catch(error){
        res.render('admin/error');
        console.log(error.message);
    }
};
