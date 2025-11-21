const express = require("express");
const {
    addCategory,
    getCategories,
    deleteCategory,
} = require("../controllers/categoryController");

const router = express.Router();

router.post("/", addCategory);
router.get("/", getCategories);
router.delete("/:id", deleteCategory);

module.exports = router;
