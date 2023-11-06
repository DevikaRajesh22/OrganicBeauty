const Coupon = require('../models/admin/couponCollection');
const Cart = require('../models/user/cartCollection');

//admin coupon() GET request
exports.coupon = async (req, res) => {
    try {
        const pageName = 'Coupons';
        const coupons = await Coupon.find();
        res.render('admin/coupon', { pageName, coupons });
    } catch (error) {
        console.log(error.message);
    }
};

//admin addCoupon() GET request
exports.addCoupon = async (req, res) => {
    try {
        const pageName = 'Coupons';
        res.render('admin/addCoupon', { pageName });
    } catch (error) {
        console.log(error.message);
    }
};

//admin addCouponPost() POST request
exports.addCouponPost = async (req, res) => {
    try {
        const coupon = new Coupon({
            couponCode: req.body.ccode,
            minimumPurchase: req.body.minPur,
            maximumDiscount: req.body.maxDis,
            lastDate: req.body.valid
        });
        await coupon.save();
        res.redirect('/admin/coupon');
    } catch (error) {
        console.log(error.message);
    }
};

//admin editCoupon() GET request
exports.editCoupon = async (req, res) => {
    try {
        const pageName = 'Coupon';
        const couponId = req.query.id;
        const coupon = await Coupon.findById({ _id: couponId });
        res.render('admin/editCoupon', { pageName, coupon });
    } catch (error) {
        console.log(error.message)
    }
};

//admin editCouponPost() POST request
exports.editCouponPost = async (req, res) => {
    try {
        const couponId = req.body.id;
        console.log(couponId);
        const updatedCouponData = {
            couponCode: req.body.ccode,
            minimumPurchase: req.body.minPur,
            maximumPurchase: req.body.maxDis,
            lastDate: req.body.valid
        };
        const test = await Coupon.findByIdAndUpdate(couponId, updatedCouponData);
        console.log(test);
        res.redirect('/admin/coupon');
    } catch (error) {
        console.log(error.message);
    }
};

//admin hideCoupon() GET request
exports.hideCoupon = async (req, res) => {
    try {
        const couponId = req.query.id;
        const test = await Coupon.updateOne({ _id: couponId }, { $set: { showStatus: false } });
        res.redirect('/admin/coupon');
    } catch (error) {
        console.log(error.message);
    }
};

//admin showCoupon() GET request
exports.showCoupon = async (req, res) => {
    try {
        const couponId = req.query.id;
        const test = await Coupon.updateOne({ _id: couponId }, { $set: { showStatus: true } });
        res.redirect('/admin/coupon');
    } catch (error) {
        console.log(error.message);
    }
};

//user applyCoupon() POST request
exports.applyCoupon = async (req, res) => {
    try {
        const user = req.session.userId;
        const couponCode = req.body.coupon;
        const cart = await Cart.findOne({ userId: user }).populate('products.productId');
        const Total = cart.products.reduce((acc, val) => acc + val.totalPrice, 0);
        const couponFound = await Coupon.findOne({ couponCode });
        const currentDate = new Date();
        const usedCoupon = await Coupon.find({ couponCode, usedUsers: { $in: [user] } });
        if (couponFound === null) {
            return res.json({empty : true })
        } else if (couponFound.lastDate < currentDate) {
            return res.json({ expired: true });
        } else if (couponFound && usedCoupon.length == 0) {
            if (Total < couponFound.minimumPurchase) {
               return res.json({ applied: false, message: "Minimum purchase doesnt match" })
            } else {
                await Cart.findOneAndUpdate({ userId: user }, { $set: { couponApplied: couponCode } });
               return res.json({ applied: true, message: 'Coupon applied' })
            }
        }
    } catch (error) {
        console.log(error.message);
    }
};

//user removeCoupon() GET request
exports.removeCoupon=async(req,res)=>{
    try{
        const userId=req.session.userId;
        await Cart.updateOne({userId},{
            $set :{
                couponApplied : ""
            }
        });
        res.redirect('/cart');
    }catch(error){
        console.log(error.message);
    }
};

