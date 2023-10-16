const Cart = require('../models/user/cartCollection');
const Product = require('../models/admin/productCollection');
const User = require('../models/user/userCollection');
const Category = require('../models/admin/categoryCollection');
const { log } = require('util');

//cartGet() GET request
exports.cartGet = async (req, res) => {
    try {
        const userId=req.session.userId;
        const users= await User.findOne({_id:userId});
        const user = req.session.name
        const pageTitle = 'Cart';
        const carts = await Cart.findOne({ userId:userId})
            .populate({
                path: 'products.productId',
                model: 'Product',
                select: 'productId productName productImage'
            });
       
            if (carts) {
                const products = carts.products.length;
              
            
                if (products > 0) { // Check if there are products in the cart
                    try {
                        const total = await Cart.aggregate([
                            { $match: { userId: userId } },
                            { $unwind: "$products" },
                            {
                                $group: {
                                    _id: null,
                                    total: {
                                        $sum: {
                                            $multiply: ["$products.productPrice", "$products.count"],
                                        },
                                    },
                                },
                            },
                        ]);
                    
            
                        if (total.length > 0) {
                            res.render('user/cart', { pageTitle, carts, product: products, total: total[0].total,user:req.session.name});
                        } else {
                            // Handle the case where total is empty or undefined
                            res.render('user/cart', { pageTitle, carts, product: products, total: 0,user});
                        }
                    } catch (err) {
                        console.error('Error in aggregation:', err);
                        // Handle the error, send an error response or redirect as needed
                    }
                }
            }
            

        
    } catch (error) {
        console.log(error);
    }
};

exports.addToCartPost = async (req, res) => {
    try {
        console.log('addtoproduct-POST');
        const user = req.session.userId; //to find user
        console.log(req.session.userId);
        if (!user) {
            return res.redirect('/');
        }
        const productId = req.query.id; //get the id by the query in a tag
        console.log('productId' + productId);
        const product = await Product.findById(productId); //finding the product by the product
        console.log("product: " + product);
        let userFound = await Cart.findOne({ userId: user }); //to check if there is a cart for the user
        console.log(userFound);
        if (!userFound) {
            //create a new cart
            const newCart = new Cart({
                userId: user,
                products: [{
                    productId: producId,
                    count: 1,
                    productPrice: product.price,
                    totalPrice: product.price
                }]
            });
            await newCart.save();
        } else {
            // Check if the product is already in the cart
            const existingProductIndex = userFound.products.findIndex(p => p.productId.toString() === productId);

            if (existingProductIndex === -1) {
                // If the product is not in the cart, add it as a new product
                userFound.products.push({
                    productId: product._id,
                    count: 1,
                    productPrice: product.price,
                    totalPrice: product.price
                });
            } else {
                // If the product is already in the cart, increase the count and adjust the price
                userFound.products[existingProductIndex].count += 1;
                userFound.products[existingProductIndex].totalPrice = userFound.products[existingProductIndex].count * product.price;
            }

            await userFound.save();
        }

        res.redirect('/products');
    } catch (error) {
        console.log(error.message);
    }
};

//updateCartQuantity() POST request
exports.updateCartQuantity = async (req, res) => {
    try {
        console.log('req received');
        const userId = req.session.userId;
        console.log(userId);
        const user= await User.findOne({_id:userId});
        const productId = req.body.productId;
        let count = req.body.count;
        count = parseInt(count);

        const cartData = await Cart.findOne({ userId: userId });
      
        const productData = await Product.findOne({ _id: productId });
        // console.log(cartData);


        if (!cartData || !productData) {
            res.json({ success: false, message: "Cart or product not found." });
            return;
        }

        const productQuantity = productData.stock;
        const existingProductIndex = cartData.products.findIndex(
            (product) => product.productId.toString() === productId.toString()
        );
      

        if (existingProductIndex === -1) {
            res.json({ success: false, message: "Product not found in the cart." });
            return;
        }

        const existingProduct = cartData.products[existingProductIndex];
        const updatedQuantity = existingProduct.count + count;

        // console.log('existingProduct', existingProduct);
         
    if (updatedQuantity < 0 || updatedQuantity > productQuantity) {
        res.json({ success: false, message: "Invalid quantity." });
        return;
      }
      if (updatedQuantity <= 0 || updatedQuantity > productQuantity) {
        return;
      }
      // Update the product count and total price in the cart
      cartData.products[existingProductIndex].count = updatedQuantity;
      console.log(cartData.products[existingProductIndex].count);
  
      // Calculate the updated total price for the product
      const productPrice = productData.price;
      const productTotal = productPrice * updatedQuantity;
      cartData.products[existingProductIndex].totalPrice = productTotal;
  
      // Save the updated cart
      await cartData.save();


        res.status(200).json({ success: true, message: 'Cart item updated successfully' });
    } catch (error) {
        console.log(error.message);
    }
};

//removeProduct() GET request
exports.removeProduct = async (req, res) => {
    try {
        console.log('removeProduct() get request');
        const userId = req.session.userId;
        const productId = req.body.productId;
        console.log('userid',userId);
        console.log('productId',productId);
        const cart = await Cart.findOne({ userId: userId });
        // console.log('cart',cart);
        if (cart) {
            await Cart.findOneAndUpdate(
              { userId: userId },
              {
                $pull: {
                  products: {
                    productId: productId,
                  },
                },
              }
            );
            res.json({ success: true });
          }
    } catch (error) {
        console.log(error.message);
    }
};


