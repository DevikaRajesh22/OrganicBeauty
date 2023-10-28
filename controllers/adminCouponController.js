//coupon() GET request
exports.coupon=async(req,res)=>{
    try{
        const pageName='Coupons';
        res.render('admin/coupon',{pageName});
    }catch(error){
        console.log(error.message);
    }
};