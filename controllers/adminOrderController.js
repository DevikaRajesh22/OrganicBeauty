const Order=require('../models/user/orderCollection');

//orderGet() GET request
exports.orderGet=async(req,res)=>{
    try{
        const pageName='Order';
        const orders=await Order.find();
       res.render('admin/orders',{pageName,orders});
    }catch(error){
        console.log(error.message);
    }
};