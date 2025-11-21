const Category = require("../models/Category");

// ➕ Add Category
const addCategory = async (req, res) => {
    try {
        const { name, parentCategory, image } = req.body;

        let slug = name.toLowerCase().replace(/\s+/g, "-");

        if (parentCategory) {
            // Fetch parent to get its name
            const parent = await Category.findById(parentCategory);
            if (parent) {
                const parentSlug = parent.slug || parent.name.toLowerCase().replace(/\s+/g, "-");
                slug = `${parentSlug}-${slug}`; // e.g., men-tshirt
            }
        }

        const category = new Category({ name, parentCategory, slug, image });
        const saved = await category.save();

        res.status(201).json(saved);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Category slug already exists" });
        }
        res.status(500).json({ message: error.message });
    }
};


// 📜 Get All Categories
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().populate("parentCategory", "name");
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🗑️ Delete Category
const deleteCategory = async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addCategory, getCategories, deleteCategory };
