const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

const authorize = require("../middleware/role.middleware");
const {

    createProduct,

    getProducts,

    getProduct,

    updateProduct,

    deleteProduct,

    verifyProduct,

} = require("../controllers/product.controller");

router.post("/", protect, authorize("MANUFACTURER"),createProduct);

router.get("/", protect, getProducts);

router.get("/verify/:qr", verifyProduct);

router.get("/:id", protect, getProduct);

router.put("/:id", protect, authorize("MANUFACTURER"),updateProduct);

router.delete("/:id", protect, authorize("MANUFACTURER"),deleteProduct);

module.exports = router;