const Cart = require("../models/user/cartCollection");
const Wishlist = require("../models/user/wishlistCollection");
const User = require("../models/user/userCollection");

//wallet() GET request
exports.wallet = async (req, res) => {
  try {
    const pageTitle = "Wallet";
    let wishlistCount = 0;
    const wishlist = await Wishlist.findOne({ user: req.session.userId });
    wishlist ? (wishlistCount = wishlist.products.length) : 0;
    const userId = req.session.userId;
    const carts = await Cart.findOne({ userId: userId });
    let count = 0;
    if (carts?.products?.length > 0) {
      count = count + carts.products.length;
    } else {
      count = 0;
    }
    const userData = await User.findOne({ _id: userId });
    const historyDetails = userData.walletHistory;
    historyDetails.sort((a, b) => {
      return b.date - a.date;
    });
    res.render("user/wallet", {
      user: req.session.name,
      pageTitle,
      count,
      userData,
      wishlistCount,
      historyDetails,
    });
  } catch (error) {
    console.log(error.message);
    res.render("user/error");
  }
};
