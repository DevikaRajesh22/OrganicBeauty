const Admin = require("../models/admin/adminCollection");
const User = require("../models/user/userCollection");
const Product = require("../models/admin/productCollection");
const Order = require("../models/user/orderCollection");
const Category = require("../models/admin/categoryCollection");
const puppeteer = require("puppeteer");
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");
const ExcelJS = require("exceljs");

//loginGet for GET request
exports.loginGet = async (req, res) => {
  try {
    let adminEmailErr = req.app.locals.adminEmailErr;
    req.app.locals.adminEmailErr = " ";
    let adminPasswordErr = req.app.locals.adminPasswordErr;
    req.app.locals.adminPasswordErr = " ";
    res.render("admin/adminLogin", { adminEmailErr, adminPasswordErr });
  } catch (error) {
    console.log(error.message);
    res.render("admin/errors");
  }
};

//loginPost for POST request
exports.loginPost = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email: email });
    if (admin) {
      if (
        admin.email == req.body.email &&
        admin.password == req.body.password
      ) {
        req.session.admin = admin.email;
        res.redirect("/admin/landing");
      } else if (admin.email !== req.body.email) {
        req.app.locals.adminEmailErr = "Invalid email!";
        res.redirect("/admin");
      } else if (admin.password !== req.body.password) {
        req.app.locals.adminPasswordErr = "Invalid Password!";
        res.redirect("/admin");
      }
    } else {
      req.app.locals.adminEmailErr = "User doesnt exist!";
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
    res.render("admin/errors");
  }
};

//landing GET request
exports.landing = async (req, res) => {
  try {
    const pageName = "Dashboard";
    const productCount = await Product.countDocuments();
    const userCount = await User.countDocuments();
    const categoryCount = await Category.countDocuments();
    const orderCount = await Order.countDocuments();
    const lastTenOrders = await Order.find().sort({ orderId: -1 }).limit(10);
    //paymentChart
    let Payment = await Order.aggregate([
      {
        $match: {
          status: "Delivered",
        },
      },
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
        },
      },
    ]);
    let onlinePaymentCount = 0;
    let cashPaymentCount = 0;
    let walletPaymentCount = 0;
    if (Payment.length > 0) {
      const onlinePayment = Payment.find(
        (payment) => payment._id === "Online payment"
      );
      const cashPayment = Payment.find(
        (payment) => payment._id === "Cash on delivery"
      );
      const walletPayment = Payment.find((payment) => payment._id === "Wallet");
      if (onlinePayment) onlinePaymentCount = onlinePayment.count || 0;
      if (cashPayment) cashPaymentCount = cashPayment.count || 0;
      if (walletPayment) walletPaymentCount = walletPayment.count || 0;
    }
    //monthChart
    const allMonths = Array.from({ length: 12 }, (_, i) => i + 1);

    const monthly = await Order.aggregate([
      {
        $match: {
          status: "Delivered",
        },
      },
      {
        $addFields: {
          date: { $toDate: "$date" },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
      {
        $group: {
          _id: "$_id.year",
          months: {
            $push: {
              month: "$_id.month",
              count: "$count",
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          months: {
            $setUnion: [
              "$months",
              allMonths.map((month) => ({ month, count: 0 })),
            ],
          },
        },
      },
    ]);
    let monthlySalesArr = [];
    if (monthly.length > 0) {
      let monthlySalesArray = monthly[0];
      if (monthlySalesArray && monthlySalesArray.months) {
        monthlySalesArray.months.map((monthInfo) =>
          monthlySalesArr.push(monthInfo.count)
        );
      }
    }
    //weekChart
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const monthDate = new Date(currentDate.getFullYear(), currentMonth - 1, 1);
    const monthName = monthDate.toLocaleString("en-US", { month: "long" });
    const startDate = new Date(`${currentYear}-${currentMonth}-01`);
    const endDate = new Date(currentYear, currentMonth, 0);
    const weekly = await Order.aggregate([
      {
        $match: {
          status: "Delivered",
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $addFields: {
          week: { $isoWeek: "$date" },
        },
      },
      {
        $group: {
          _id: "$week",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
      {
        $group: {
          _id: null,
          weeks: { $push: { week: "$_id", count: "$count" } },
        },
      },
    ]);
    let weeklySalesArr = [];
    if (weekly.length > 0 && weekly[0].weeks) {
      weekly[0].weeks.forEach((weekData) => {
        weeklySalesArr.push(weekData.count);
      });
    }
    const result = weeklySalesArr;
    const desiredLength = 5;
    const paddedArray = result.concat(
      Array(desiredLength - result.length).fill(0)
    );
    weeklySalesArr = paddedArray;
    //categoryChart
    const productWiseAggregate = Product.aggregate([
      {
        $addFields: {
          categoryId: { $toObjectId: "$category" },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      {
        $group: {
          _id: "$categoryDetails.categoryName",
          count: { $sum: 1 },
        },
      },
    ]);

    const productWise = await productWiseAggregate.exec();
    const categoryName = productWise.map((item) => item._id[0]);
    let categoryLength = categoryName.length;
    const categoryCounts = productWise.map((item) => item.count);

    res.render("admin/landing", {
      pageName,
      productCount,
      userCount,
      categoryCount,
      orderCount,
      admin: req.session.admin,
      lastTenOrders,
      onlinePaymentCount,
      cashPaymentCount,
      walletPaymentCount,
      monthlySalesArr,
      weeklySalesArr,
      currentYear,
      monthName,
      categoryName,
      categoryLength,
      categoryCounts,
    });
  } catch (error) {
    console.log(error.message);
    res.render("admin/errors");
  }
};

//signout GET request
exports.signout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
      }
      res.redirect("/admin/");
    });
  } catch (error) {
    console.log(error.message);
    res.render("admin/errors");
  }
};

//users GET request
exports.users = async (req, res) => {
  try {
    const pageName = "User management";
    let pageNum = req.query.pageNum;
    let perPage = 8;
    let userCount = await User.find().countDocuments();
    let page = Math.ceil(userCount / perPage);
    const users = await User.find()
      .skip((pageNum - 1) * perPage)
      .limit(perPage);
    res.render("admin/users", {
      users,
      pageName,
      page,
      admin: req.session.admin,
    });
  } catch (error) {
    console.log(error.message);
    res.render("admin/errors");
  }
};

//blockUser POST request
exports.blockUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      // return res.status(404).json({ message: 'User not found' });
      console.log("blockUser: user not found");
    } else {
      user.isBlocked = true;
      await user.save();
      res.redirect("/admin/users");
    }
  } catch (error) {
    console.log(error.message);
    res.render("admin/errors");
  }
};

//unblockUser POST request
exports.unblockUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      console.log("unblockUser: user not found");
    } else {
      user.isBlocked = false;
      await user.save();
      res.redirect("/admin/users");
    }
  } catch (error) {
    console.log(error.message);
    res.render("admin/errors");
  }
};

//salesReport() GET request
exports.salesReport = async (req, res) => {
  try {
    const pageName = "Sales Report";
    const orderData = await Order.aggregate([
      { $unwind: "$products" },
      { $match: { status: "Delivered" } },
      { $sort: { date: -1 } },
      {
        $lookup: {
          from: "products",
          let: { productId: { $toObjectId: "$products.productId" } },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$productId"] } } }],
          as: "products.productDetails",
        },
      },
      {
        $addFields: {
          "products.productDetails": {
            $arrayElemAt: ["$products.productDetails", 0],
          },
        },
      },
    ]);
    res.render("admin/salesReport", {
      pageName,
      orderData,
      admin: req.session.admin,
    });
  } catch (error) {
    console.log(error.message);
    res.render("admin/errors");
  }
};

//user sort() GET request
exports.sort = async (req, res) => {
  try {
    const pageName = "Sales Report";
    const duration = parseInt(req.query.id);
    const currentDate = new Date();
    const startDate = new Date(currentDate - duration * 24 * 60 * 60 * 1000);
    const orderData = await Order.aggregate([
      {
        $unwind: "$products",
      },
      {
        $match: {
          status: "Delivered",
          date: { $gte: startDate, $lt: currentDate },
        },
      },
      {
        $sort: { date: -1 },
      },
      {
        $lookup: {
          from: "products",
          let: { productId: { $toObjectId: "$products.productId" } },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$productId"] } } }],
          as: "products.productDetails",
        },
      },
      {
        $addFields: {
          "products.productDetails": {
            $arrayElemAt: ["$products.productDetails", 0],
          },
        },
      },
    ]);
    res.render("admin/salesReport", {
      pageName,
      orderData,
      admin: req.session.admin,
    });
  } catch (error) {
    console.log(error.message);
    res.render("admin/errors");
  }
};

//user downloadReport() GET request
exports.downloadReport = async (req, res) => {
  try {
    const { format, duration } = req.query;
    const currentDate = new Date();
    const startDate = new Date(currentDate - 1 * 24 * 60 * 60 * 1000);
    const orders = await Order.aggregate([
      {
        $unwind: "$products",
      },
      {
        $match: {
          status: "Delivered",
        },
      },
      {
        $sort: { deliveryDate: -1 },
      },
      {
        $lookup: {
          from: "products",
          let: { productId: { $toObjectId: "$products.productId" } },
          pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$productId"] } } }],
          as: "products.productDetails",
        },
      },
      {
        $addFields: {
          "products.productDetails": {
            $arrayElemAt: ["$products.productDetails", 0],
          },
        },
      },
    ]);
    const totalSales = await Order.find({ status: "Delivered" }).count();
    const totalOrders = await Order.find().count();
    const date = new Date();
    data = {
      orders,
      date,
      totalSales,
      totalOrders,
    };
    if (format === "pdf") {
      const filepathName = path.resolve(
        __dirname,
        "../views/admin/invoice.ejs"
      );
      const html = fs.readFileSync(filepathName).toString();
      const ejsData = ejs.render(html, data);
      const browser = await puppeteer.launch({ headless: "new" });
      const page = await browser.newPage();
      await page.setContent(ejsData, { waitUntil: "networkidle0" });
      const pdfBytes = await page.pdf({ format: "letter" });
      await browser.close();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename= Sales Report.pdf"
      );
      res.send(pdfBytes);
    } else if (format === "excel") {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sales Report");
      worksheet.columns = [
        { header: "Order ID", key: "orderId", width: 8 },
        { header: "Product Name", key: "productName", width: 50 },
        { header: "Qty", key: "qty", width: 5 },
        { header: "Date", key: "date", width: 12 },
        { header: "Customer", key: "customer", width: 15 },
        { header: "Total Amount", key: "totalAmount", width: 12 },
      ];
      orders.forEach((data) => {
        worksheet.addRow({
          orderId: data.orderId,
          productName: data.products.productDetails.productName,
          qty: data.products.count,
          date: data.date
            .toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "2-digit",
            })
            .replace(/\//g, "-"),
          customer: data.userName,
          totalAmount: data.products.totalPrice,
        });
      });
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=sales_report.csv`
      );
      const excelBuffer = await workbook.csv.writeBuffer();
      res.end(excelBuffer);
    }
  } catch (error) {
    console.log(error.message);
    res.render("admin/errors");
  }
};
