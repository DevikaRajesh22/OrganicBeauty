//loginGet for GET request
exports.loginGet=async(req,res)=>{
    try{
        res.render('user/userLogin');
    }catch(error){
        console.log(error.message);
        res.render('user/error');
    }
};

//userLoginPost for POST request
exports.userLoginPost=async(req,res)=>{
    try{
        res.render('user/landingPage');
    }catch(error){
        console.log(error.message);
        res.render('user/error');
    }
};

//registerGet for GET request
exports.registerGet=async(req,res)=>{
    try{
        res.render('user/register');
    }catch(error){
        console.log(error.message);
        res.render('user/error');
    }
};

//registerPost for POST request
exports.registerPost=async(req,res)=>{
    try{
        res.render('user/userLogin');
    }catch(error){
        console.log(error.message);
        res.render('user/error');
    }
};

//landingPage for GET request
exports.landingPage=async(req,res)=>{
    try{
        const pageTitle='Home';
        res.render('user/landingPage',{pageTitle});
    }catch(error){
        console.log(error.message);
        res.render('user/error');
    }
};

//productsGet for GET request
exports.productsGet=async(req,res)=>{
    try{
        const pageTitle='Products';
        res.render('user/products',{pageTitle});
    }catch(error){
        console.log(error.message);
        res.render('user/error');
    }
};

//error GET request
exports.error=async(req,res)=>{
    res.render('user/error');
};