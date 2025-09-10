const express = require("express");
const router = express.Router();
const { adminLogin, adminRegister,addBus, deleteBus } = require("../controllers/adminController");

router.post("/register", adminRegister);
router.post("/login", adminLogin);
router.post("/addBus", addBus);
router.delete("/deleteBus/:id", deleteBus);

module.exports = router;
