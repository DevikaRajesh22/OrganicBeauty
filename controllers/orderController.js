const User=require('../models/user/userCollection');
const Order=require('../models/user/orderCollection');

//orders() GET request
exports.orders = async (req, res) => {
    try {
        const pageTitle = 'Orders';
        const userId=req.session.userId;
        const users=await User.findOne({_id:userId});
        if(userId===undefined){
            return res.redirect('/login');
        }
        if(!users){
            return res.redirect('/login');
        }
        res.render('user/orders', { user: req.session.name, pageTitle });
    } catch (error) {
        console.log(error.message);
    }
};

//placeOrder() POST request
exports.placeOrder=async(req,res)=>{
    try{
        console.log('place order post request');
        

    }catch(error){
        console.log(error.message);
    }
};