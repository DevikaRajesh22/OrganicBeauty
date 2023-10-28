const Coupon = require('../models/admin/couponCollection');

//coupon() GET request
exports.coupon = async (req, res) => {
    try {
        const pageName = 'Coupons';
        const coupons = await Coupon.find();
        res.render('admin/coupon', { pageName, coupons });
    } catch (error) {
        console.log(error.message);
    }
};

//addCoupon() GET request
exports.addCoupon = async (req, res) => {
    try {
        const pageName = 'Coupons';
        res.render('admin/addCoupon', { pageName });
    } catch (error) {
        console.log(error.message);
    }
};

//addCouponPost() POST request
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

//editCoupon() GET request
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

//editCouponPost() POST request
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

//hideCoupon() GET request
exports.hideCoupon = async (req, res) => {
    try {
        const couponId = req.query.id;
        const test = await Coupon.updateOne({ _id: couponId }, { $set: { showStatus: false } });
        res.redirect('/admin/coupon');
    } catch (error) {
        console.log(error.message);
    }
};

//showCoupon() GET request
exports.showCoupon = async (req, res) => {
    try {
        const couponId = req.query.id;
        const test = await Coupon.updateOne({ _id: couponId }, { $set: { showStatus: true } });
        res.redirect('/admin/coupon');
    } catch (error) {
        console.log(error.message);
    }
};