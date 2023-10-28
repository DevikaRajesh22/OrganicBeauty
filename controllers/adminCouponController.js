const Coupon=require('../models/admin/couponCollection');

//coupon() GET request
exports.coupon=async(req,res)=>{
    try{
        const pageName='Coupons';
        const coupons=await Coupon.find();
        res.render('admin/coupon',{pageName,coupons});
    }catch(error){
        console.log(error.message);
    }
};

//addCoupon() GET request
exports.addCoupon=async(req,res)=>{
    try{
        const pageName='Coupons';
        res.render('admin/addCoupon',{pageName});
    }catch(error){
        console.log(error.message);
    }
};

//addCouponPost() POST request
exports.addCouponPost=async(req,res)=>{
    try{
        const coupon=new Coupon({
            couponCode:req.body.ccode,
            minimumPurchase:req.body.minPur,
            maximumDiscount:req.body.maxDis,
            lastDate:req.body.valid 
        });
        await coupon.save();
        res.redirect('/admin/coupon');
    }catch(error){
        console.log(error.message);
    }
}