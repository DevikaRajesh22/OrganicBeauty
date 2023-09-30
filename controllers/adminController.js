//loginGet for GET request
exports.loginGet=async(req,res)=>{
    try{
        res.render('adminLogin');
    }catch(error){
        console.log(error.message);
    }
};

