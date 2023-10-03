const User = require('../models/user/userCollection');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

//for otp using nodemailer
let randomNumber;
let emailOne;
const smtpConfig = {
    service: "Gmail",
    auth: {

        user: "devikaraj699@gmail.com",
        pass: "vtey pzad jmzy ofoj",

    }
}

//for bcrypting password
const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
};

//loginGet for GET request
exports.loginGet = async (req, res) => {
    try {
        res.render('user/userLogin');
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//userLoginPost for POST request
exports.userLoginPost = async (req, res,next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const user = await User.findOne({ email:email });
        console.log(user);
        if (user) {
            const passwordMatch = await bcrypt.compare(password, user.spassword);
            if (passwordMatch && !user.isBlocked && user.isVerified) {
                //setting up user session
                req.session.userId = user._id;
                req.session.name = user.name;
                req.session.email = user.email;
                req.session.phone = user.number;
                return res.redirect('/landingPage'); //if password match then store user session and redirect to landingPage
            }
        }
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//registerGet for GET request
exports.registerGet = async (req, res) => {
    try {
        res.render('user/register');
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//registerPost for POST request
exports.registerPost = async (req, res) => {
    try {
        const transporter = nodemailer.createTransport(smtpConfig);
        emailOne = req.body.email;
        randomNumber = Math.floor(Math.random() * 9000) + 1000;
        console.log('registerPost'+randomNumber);
        const spassword = await securePassword(req.body.spassword);
        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            number: req.body.number,
            spassword: spassword
        });
        console.log(req.body);
        const userData = await newUser.save();
        req.app.locals.specialContext = 'Sign up successful! Please login';
        const mailOptions = {
            from: "devikaraj699@gmail.com",
            to: emailOne,
            subject: "Your OTP for signup",
            text: `Your OTP is ${randomNumber}`,
        };
        transporter.sendMail(mailOptions);
        res.redirect('/otp');
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//landingPage for GET request
exports.landingPage = async (req, res) => {
    try {
        const pageTitle = 'Home';
        res.render('user/landingPage', { pageTitle });
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//otp GET request
exports.otp = async (req, res) => {
    try {
        res.render('user/otp');
    } catch (error) {
        console.log(error.message);
        res.render('user/error');
    }
};

//otp POST request
exports.otpPost = async (req, res) => {
    try {
        const { otp } = req.body;
        console.log(otp);
            console.log(randomNumber);
        if (randomNumber == otp) {
            console.log(otp);
            console.log(randomNumber);
            console.log(emailOne);
            const verified = await User.updateOne({ email: emailOne }, { $set: { isVerified: true } });
            console.log(verified);
            if (verified.nModified===1) {
                res.redirect('/');
            } else {
                res.redirect('/otp');
                console.log('A');
            }
        } else {
            res.redirect('/otp');
            console.log('B');
        }
    }catch(error){
        console.log(error.message);
        res.render('user/error');
    }   
};

//logout GET request
exports.logout=async(req,res)=>{
    try{
        req.session.destroy(err=>{
            if(err){
                console.error('Error destroying session:',err);
            }
            res.redirect('/');
        });
    }catch(error){
        res.render('user/error');
        console.log(error.message)
;    }
};

//error GET request
exports.error = async (req, res) => {
    res.render('user/error');
};