const Coupon = require('../models/admin/couponCollection');
const Cart = require('../models/user/cartCollection');

//admin coupon() GET request
exports.coupon = async (req, res) => {
    try {
        const pageName = 'Coupons';
        let pageNum = req.query.pageNum;
        let perPage = 8;
        let couponCount = await Coupon.find().countDocuments();
        let page = Math.ceil(couponCount / perPage);
        const coupons = await Coupon.find().skip((pageNum - 1) * perPage).limit(perPage);
        res.render('admin/coupon', { pageName, coupons, page, admin: req.session.admin });
    } catch (error) {
        console.log(error.message);
        res.render('admin/errors');
    }
};

//admin addCoupon() GET request
exports.addCoupon = async (req, res) => {
    try {
        const pageName = 'Coupons';
        res.render('admin/addCoupon', { pageName, admin: req.session.admin });
    } catch (error) {
        console.log(error.message);
        res.render('admin/errors');
    }
};

//admin addCouponPost() POST request
exports.addCouponPost = async (req, res) => {
    try {
        const couponCode = req.body.couponCode;
        const minimumPurchase = req.body.minimumPurchase;
        const maximumDiscount = req.body.maximumDiscount;
        const lastDate = req.body.lastDate;
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Adding 1 to month because it starts from 0
        const day = String(currentDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        const couponFound = await Coupon.findOne({ couponCode: couponCode });
        if (lastDate < formattedDate) {
            res.json({ dateValidation: true });
        } else if (maximumDiscount >= minimumPurchase) {
            res.json({ priceError: true });
        } else if (couponFound) {
            res.json({ notUnique: true });
        } else if (couponFound === null) {
            const coupon = new Coupon({
                couponCode: couponCode,
                minimumPurchase: minimumPurchase,
                maximumDiscount: maximumDiscount,
                lastDate: lastDate,
            });
            await coupon.save();
            res.json({ success: true });
        }
    } catch (error) {
        console.log(error.message);
        res.render('admin/errors');
    }
};

//admin editCoupon() GET request
exports.editCoupon = async (req, res) => {
    try {
        const pageName = 'Coupon';
        const couponId = req.query.id;
        const coupon = await Coupon.findById({ _id: couponId });
        res.render('admin/editCoupon', { pageName, coupon, admin: req.session.admin });
    } catch (error) {
        console.log(error.message);
        res.render('admin/errors');
    }
};

//admin editCouponPost() POST request
exports.editCouponPost = async (req, res) => {
    try {
        const couponId = req.body.id;
        const updatedCouponData = {
            couponCode: req.body.ccode,
            minimumPurchase: req.body.minPur,
            maximumPurchase: req.body.maxDis,
            lastDate: req.body.valid
        };
        const test = await Coupon.findByIdAndUpdate(couponId, updatedCouponData);
        res.redirect('/admin/coupon');
    } catch (error) {
        console.log(error.message);
        res.render('admin/errors');
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
        res.render('admin/errors');
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
        res.render('admin/errors');
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
            return res.json({ empty: true })
        } else if (couponFound.lastDate < currentDate) {
            return res.json({ expired: true });
        } else if (couponFound && usedCoupon.length == 0 && Total < couponFound.minimumPurchase) {
            return res.json({ appliedFalse: true });
        } else if (couponFound && usedCoupon.length == 0) {
            await Cart.findOneAndUpdate(
                { userId: user },
                {
                    $set: {
                        couponApplied: couponCode,
                        coupon: couponCode
                    }
                }
            );
           return  res.json({ appliedTrue: true })
        }
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//user removeCoupon() GET request
exports.removeCoupon = async (req, res) => {
    try {
        const userId = req.session.userId;
        await Cart.updateOne({ userId }, {
            $set: {
                couponApplied: ""
            }
        });
        res.redirect('/cart');
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

