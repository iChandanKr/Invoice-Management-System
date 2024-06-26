const express = require("express");
const productController = require("../controllers/productController");
const authController = require("../controllers/authController");

const router = express.Router();
// const authctrl = require("../controllers/authController");

router.route("/").get(authController.protect, productController.readProducts).post(authController.protect, productController.addProduct);

router.route("/findByIds").post(authController.protect, productController.readProductsByIds);

router
  .route("/:productId")
  .get(authController.protect, productController.readProductById)
  .patch(authController.protect, productController.updateProduct)
  .delete(authController.protect, productController.deleteProduct);


module.exports = router;
