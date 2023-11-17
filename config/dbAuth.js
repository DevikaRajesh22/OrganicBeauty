const mongoose = require("mongoose");

exports.database = () => {
    mongoose.connect(process.env.DB_URL);
}