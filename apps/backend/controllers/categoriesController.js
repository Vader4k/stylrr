import mongoose from "mongoose";
import { Category } from "../models/category.model.js";
import { CATEGORIES_TAG, PRODUCTS_TAG, revalidateStorefront } from "../utils/revalidate.js";

export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.aggregate([
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "category",
                    as: "categoryProducts"
                }
            },
            {
                $lookup: {
                    from: "tags",
                    localField: "tags",
                    foreignField: "_id",
                    as: "tags"
                }
            },
            {
                $addFields: {
                    items: { $size: "$categoryProducts" }
                }
            },
            {
                $project: {
                    categoryProducts: 0
                }
            }
        ]);


        if (!categories || categories.length === 0) {
            return res.status(200).json({ message: "No categories found", categories: [] });
        }

        res.status(200).json({
            success: true,
            message: "Categories fetched successfully",
            categories
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getAllCategoriesPublic = async (req, res) => {
    try {
        const categories = await Category.aggregate([
            {
                $match: { isActive: true }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "category",
                    as: "categoryProducts"
                }
            },
            {
                $lookup: {
                    from: "tags",
                    localField: "tags",
                    foreignField: "_id",
                    as: "tags"
                }
            },
            {
                $addFields: {
                    items: { $size: "$categoryProducts" }
                }
            },
            {
                $project: {
                    name: 1,
                    slug: 1,
                    items: 1,
                    description: 1,
                    tags: 1,
                    isActive: 1
                }
            }
        ]);

        if (!categories || categories.length === 0) {
            return res.status(200).json({ message: "No categories found", categories: [] });
        }
        res.status(200).json({
            success: true,
            message: "Categories fetched successfully",
            categories
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getCategoryTags = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id).select("tags name");
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
        res.status(200).json({
            success: true,
            message: "Tags fetched successfully",
            tags: category.tags
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const addCategory = async (req, res) => {
    try {
        const { name, slug, description, isActive, tags } = req.body;

        // Process tags: find existing or create new ones
        let tagIds = [];
        if (tags && Array.isArray(tags)) {
            for (let tagName of tags) {
                if (typeof tagName === 'object' && tagName !== null) {
                    tagName = tagName._id || tagName.name;
                }
                // Determine if tagName is an ID (from existing tag) or a new string
                let tag;
                if (mongoose.Types.ObjectId.isValid(tagName)) {
                    tag = await mongoose.model("Tag").findById(tagName);
                } else if (tagName) {
                    tag = await mongoose.model("Tag").findOne({ name: tagName });
                    if (!tag) {
                        tag = await mongoose.model("Tag").create({ name: tagName });
                    }
                }
                if (tag) tagIds.push(tag._id);
            }
        }

        const category = await Category.create({ name, slug, description, isActive, tags: tagIds });
        revalidateStorefront([CATEGORIES_TAG]);
        res.status(201).json({
            success: true,
            message: "Category added successfully",
            category
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const updateCategory = async (req, res) => {
    try {
        const { name, slug, description, isActive, tags } = req.body;

        // Process tags: find existing or create new ones
        let tagIds = [];
        if (tags && Array.isArray(tags)) {
            for (let tagName of tags) {
                if (typeof tagName === 'object' && tagName !== null) {
                    tagName = tagName._id || tagName.name;
                }
                let tag;
                if (mongoose.Types.ObjectId.isValid(tagName)) {
                    tag = await mongoose.model("Tag").findById(tagName);
                } else if (tagName) {
                    tag = await mongoose.model("Tag").findOne({ name: tagName });
                    if (!tag) {
                        tag = await mongoose.model("Tag").create({ name: tagName });
                    }
                }
                if (tag) tagIds.push(tag._id);
            }
        }

        const category = await Category.findByIdAndUpdate(req.params.id, { name, slug, description, isActive, tags: tagIds }, { new: true });
        // product pages and listings show category names, so refresh product data too
        revalidateStorefront([CATEGORIES_TAG, PRODUCTS_TAG]);
        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            category
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        revalidateStorefront([CATEGORIES_TAG, PRODUCTS_TAG]);
        res.status(200).json({
            success: true,
            message: "Category deleted successfully",
            category
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const deleteCategoryTags = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        revalidateStorefront([CATEGORIES_TAG, PRODUCTS_TAG]);
        res.status(200).json({
            success: true,
            message: "Category deleted successfully",
            category
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}