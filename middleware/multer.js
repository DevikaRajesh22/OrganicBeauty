const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Specify the directory where uploaded files will be stored
    cb(null, "public/product");
  },
  filename: (req, file, cb) => {
    // Generate a unique filename for the uploaded file (you can customize this)
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname +
        "-" +
        uniqueSuffix +
        "." +
        file.originalname.split(".").pop()
    );
  },
});

exports.upload = multer({ storage });
