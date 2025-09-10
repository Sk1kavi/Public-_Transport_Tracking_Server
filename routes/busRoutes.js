const express = require("express");
const router = express.Router();
const {getBusById,getBuses,subscribeBus} = require("../controllers/busController");

router.get("/buses", getBuses);
router.get("/:busId", getBusById);
router.post("/subscribe", subscribeBus);

module.exports = router;
