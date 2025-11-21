const Product = require("../models/product");
const Category = require("../models/category");

// 📦 Get all products
const getProducts = async (req, res) => {
    try {
        const filter = {};

        if (req.query.search) {
            const keyword = req.query.search.trim();

            // 🔍 Search across multiple text fields
            filter.$or = [
                { name: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
                { "keyFeatures.label": { $regex: keyword, $options: "i" } },
                { "keyFeatures.value": { $regex: keyword, $options: "i" } },
                { "variants.color": { $regex: keyword, $options: "i" } },
                { "variants.sizes.size": { $regex: keyword, $options: "i" } },
            ];
        }

        const products = await Product.find(filter)
            .populate({
                path: "category",
                select: "name parentCategory",
                populate: { path: "parentCategory", select: "name" },
            })
            .sort({ createdAt: -1 });

        res.json(products);
    } catch (error) {
        console.error("❌ Error fetching products:", error);
        res.status(500).json({ message: error.message });
    }
};


const getProductsBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        // 1) find target category by slug
        const category = await Category.findOne({ slug });
        if (!category) return res.status(404).json({ message: "Category not found" });

        // 2) collect category IDs: the category itself + its direct children
        const childCats = await Category.find({ parentCategory: category._id }, "_id");
        const categoryIds = [category._id, ...childCats.map((c) => c._id)];

        // 3) find products whose category is in that list (populate category name)
        const products = await Product.find({ category: { $in: categoryIds } })
            .populate({
                path: "category",
                select: "name parentCategory",
                populate: { path: "parentCategory", select: "name" },
            })
            .sort({ createdAt: -1 });

        res.json({
            category: { _id: category._id, name: category.name, slug: category.slug },
            count: products.length,
            products,
        });
    } catch (error) {
        console.error("❌ Error in getProductsBySlug:", error);
        res.status(500).json({ message: error.message });
    }
}

// @desc Get featured products
const getFeaturedProducts = async (req, res) => {
    try {
        const products = await Product.find({ isFeatured: true })
            .sort({ createdAt: -1 })
            .limit(8);
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: "Error fetching featured products" });
    }
};



// 🔍 Get single product
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product)
            return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ➕ Create product
const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            mrp,
            basePrice,
            thumbnailImage, // 🆕 changed from images to single thumbnail
            isFeatured,
            variants = [],
            keyFeatures = [],
            productDescription = "",
        } = req.body;

        // 🧮 Top-level discount
        const discount =
            mrp && basePrice ? Math.round(((mrp - basePrice) / mrp) * 100) : 0;

        // 🧩 Format variants
        const formattedVariants = Array.isArray(variants)
            ? variants.map((variant) => ({
                color: variant.color || "",
                colorCode: variant.colorCode || "",
                images: variant.images || [],
                sizes: Array.isArray(variant.sizes)
                    ? variant.sizes.map((s) => {
                        const sizeMrp = s.mrp || mrp;
                        const sizePrice = s.price || basePrice;
                        const sizeDiscount =
                            sizeMrp && sizePrice
                                ? Math.round(((sizeMrp - sizePrice) / sizeMrp) * 100)
                                : 0;

                        return {
                            size: s.size,
                            price: sizePrice,
                            mrp: sizeMrp,
                            discount: sizeDiscount,
                            countInStock: s.countInStock || 0,
                        };
                    })
                    : [],
            }))
            : [];

        const product = new Product({
            name,
            description,
            category,
            mrp,
            basePrice,
            discount,
            thumbnailImage, // 🆕 main image used in product card
            isFeatured: !!isFeatured, // ensures true/false
            variants: formattedVariants,
            keyFeatures,
            productDescription,
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        console.error("❌ Error creating product:", error);
        res.status(400).json({ message: error.message });
    }
};

// ✏️ Update product
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // 🧮 Recalculate main discount
        if (updates.mrp && updates.basePrice) {
            updates.discount = Math.round(
                ((updates.mrp - updates.basePrice) / updates.mrp) * 100
            );
        }

        // 🧩 Recalculate variant discounts
        if (Array.isArray(updates.variants)) {
            updates.variants = updates.variants.map((variant) => ({
                ...variant,
                sizes: Array.isArray(variant.sizes)
                    ? variant.sizes.map((s) => {
                        const sizeMrp = s.mrp || updates.mrp;
                        const sizePrice = s.price || updates.basePrice;
                        const sizeDiscount =
                            sizeMrp && sizePrice
                                ? Math.round(((sizeMrp - sizePrice) / sizeMrp) * 100)
                                : 0;

                        return { ...s, discount: sizeDiscount };
                    })
                    : [],
            }));
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });

        if (!updatedProduct)
            return res.status(404).json({ message: "Product not found" });

        res.json(updatedProduct);
    } catch (error) {
        console.error("❌ Error updating product:", error);
        res.status(400).json({ message: error.message });
    }
};

// 🧮 Filtered + Sorted products
const getFilteredProducts = async (req, res) => {
    try {
        const { category, minPrice, maxPrice, sortBy, order } = req.query;

        const filter = {};

        // 🔸 Filter by category
        if (category) {
            filter.category = category;
        }

        // 💰 Filter by price range
        if (minPrice || maxPrice) {
            filter.basePrice = {};
            if (minPrice) filter.basePrice.$gte = Number(minPrice);
            if (maxPrice) filter.basePrice.$lte = Number(maxPrice);
        }

        // 🔃 Sorting logic
        let sortOption = {};
        if (sortBy) {
            const sortOrder = order === "desc" ? -1 : 1;
            sortOption[sortBy] = sortOrder;
        }

        // 📊 Fetch from DB
        const products = await Product.find(filter).sort(sortOption);

        res.json(products);
    } catch (error) {
        console.error("❌ Error filtering products:", error);
        res.status(500).json({ message: error.message });
    }
};

// ❌ Delete product
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Product.findByIdAndDelete(id);
        if (!deleted)
            return res.status(404).json({ message: "Product not found" });

        res.json({ message: "✅ Product removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProducts,
    getProductsBySlug,
    getFeaturedProducts,
    getProductById,
    createProduct,
    updateProduct,
    getFilteredProducts,
    deleteProduct,
};
