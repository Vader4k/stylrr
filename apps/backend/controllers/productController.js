import { Product } from "../models/product.model.js";
import { Category, Tag } from "../models/category.model.js";
import { deleteFromCloudinary, uploadFromBuffer } from "../utils/cloudinary.js";
import mongoose from "mongoose";
import { PRODUCTS_TAG, productTag, revalidateStorefront } from "../utils/revalidate.js";

export const getAllProducts = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(query)
      .populate("category", "name")
      .populate("tags", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    if (!products || products.length === 0) {
      return res
        .status(200)
        .json({
          success: true,
          message: "No products found",
          products: [],
          pagination: {
            totalProducts: 0,
            currentPage: 1,
            totalPages: 0,
            limit: Number(limit),
          },
        });
    }

    const totalProducts = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      products,
      pagination: {
        totalProducts,
        currentPage: Number(page),
        totalPages: Math.ceil(totalProducts / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllProductsPublic = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 16,
      tags,
      minPrice,
      maxPrice,
      sizes,
      colors,
      category,
      sort,
    } = req.query;

    const query = {};

    // Filtering by tags (comma separated string)
    if (tags) {
      const tagNames = tags.split(",");
      const foundTags = await Tag.find({
        name: {
          $in: tagNames.map((name) => new RegExp(`^${name.trim()}$`, "i")),
        },
      });
      const tagIds = foundTags.map((tag) => tag._id);
      query.tags = {
        $in: tagIds.length > 0 ? tagIds : [new mongoose.Types.ObjectId()],
      };
    }

    // Filtering by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Filtering by sizes (comma separated string)
    if (sizes) {
      query["inventory.size"] = { $in: sizes.split(",").map((s) => s.trim()) };
    }

    // Filtering by colors (comma separated string)
    if (colors) {
      query["colors.name"] = { $in: colors.split(",").map((c) => c.trim()) };
    }

    // Filtering by category (comma separated string of NAMES)
    if (category) {
      const categorySlugs = category.split(",").map((s) => s.trim());
      const foundCategories = await Category.find({
        slug: { $in: categorySlugs },
      });
      const categoryIds = foundCategories.map((cat) => cat._id);
      query.category = {
        $in:
          categoryIds.length > 0
            ? categoryIds
            : [new mongoose.Types.ObjectId()],
      };
    }

    // Building sorting options
    let sortOption = { createdAt: -1 }; // default sorting
    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };
    if (sort === "newest") sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    if (sort === "sold") sortOption = { sold: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(query)
      .populate("category", "name")
      .populate("tags", "name")
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .select("-__v -createdAt");

    if (!products || products.length === 0) {
      return res
        .status(200)
        .json({
          success: true,
          message: "No products found",
          products: [],
          pagination: {
            totalProducts: 0,
            currentPage: 1,
            totalPages: 0,
            limit: Number(limit),
          },
        });
    }

    const totalProducts = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      products,
      pagination: {
        totalProducts,
        currentPage: Number(page),
        totalPages: Math.ceil(totalProducts / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductBySlugPublic = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate("category", "name")
      .populate("tags", "name")
      .lean()
      .select("-__v -createdAt -updatedAt");
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const categoryParam = req.params.category;

    if (!categoryParam.match(/^[0-9a-fA-F]{24}$/)) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    const category = await Category.findById(categoryParam);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    const products = await Product.find({ category: category._id })
      .populate("category", "name")
      .populate("tags", "name")
      .select("-__v -createdAt -updatedAt");
    if (!products || products.length === 0) {
      return res
        .status(200)
        .json({
          success: true,
          message: "No products found for this category",
          products: [],
        });
    }
    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductsByCategoryPublic = async (req, res) => {
  try {
    const categoryParam = req.params.category;

    let category = await Category.findOne({ slug: categoryParam });

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    const products = await Product.find({ category: category._id })
      .populate("category", "name")
      .populate("tags", "name")
      .select("-__v -createdAt -updatedAt")
      .sort({ createdAt: -1 })
      .limit(8);
    if (!products || products.length === 0) {
      return res
        .status(200)
        .json({
          success: true,
          message: "No products found for this category",
          products: [],
        });
    }
    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductsBySearch = async (req, res) => {
  try {
    const products = await Product.find({
      $text: { $search: req.params.search },
    })
      .populate("category", "name")
      .populate("tags", "name")
      .select("-__v -createdAt -updatedAt");
    if (!products || products.length === 0) {
      return res
        .status(200)
        .json({ success: true, message: "No products found", products: [] });
    }
    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addProduct = async (req, res) => {
  try {
    const { ...productData } = req.body;
    let imageUrls = [];

    // Handle multiple images from files (FormData)
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const uploadedUrl = await uploadFromBuffer(file.buffer, "stylr");
        if (uploadedUrl) imageUrls.push(uploadedUrl);
      }
    }

    // Parse JSON strings if fields are sent as such via FormData
    const parsedProductData = { ...productData };
    if (typeof productData.inventory === "string")
      parsedProductData.inventory = JSON.parse(productData.inventory);
    if (
      parsedProductData.inventory &&
      Array.isArray(parsedProductData.inventory)
    ) {
      parsedProductData.inventory = parsedProductData.inventory.map((item) => ({
        ...item,
        size: item.size.toLowerCase(),
        quantity: Number(item.quantity),
      }));
    }
    if (typeof productData.colors === "string")
      parsedProductData.colors = JSON.parse(productData.colors);
    if (typeof productData.tags === "string")
      parsedProductData.tags = JSON.parse(productData.tags);
    if (typeof productData.category === "string")
      parsedProductData.category = JSON.parse(productData.category);
    if (productData.price) parsedProductData.price = Number(productData.price);
    if (productData.discountPrice)
      parsedProductData.discountPrice = Number(productData.discountPrice);
    if (productData.discountPercentage)
      parsedProductData.discountPercentage = Number(
        productData.discountPercentage,
      );

    const product = new Product({
      ...parsedProductData,
      images: imageUrls,
    });

    await product.save();
    revalidateStorefront([PRODUCTS_TAG]);
    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { existingImages, ...updateData } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    let currentImages = [];
    if (existingImages) {
      currentImages =
        typeof existingImages === "string"
          ? JSON.parse(existingImages)
          : existingImages;
    }

    // Handle case where existing images are sent in req.body.images (common with some frontend implementations)
    if (req.body.images) {
      const bodyImages = Array.isArray(req.body.images)
        ? req.body.images
        : [req.body.images];
      const urlsFromLinks = bodyImages.filter(
        (img) => typeof img === "string" && img.startsWith("http"),
      );
      currentImages = [...new Set([...currentImages, ...urlsFromLinks])];
    }

    let newImageUrls = [...currentImages];

    // Handle new image uploads from files (FormData)
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const uploadedUrl = await uploadFromBuffer(file.buffer, "stylr");
        if (uploadedUrl) newImageUrls.push(uploadedUrl);
      }
    }

    // Identify images to delete from Cloudinary (those not in newImageUrls)
    const imagesToDelete = product.images.filter(
      (url) => !newImageUrls.includes(url),
    );
    for (const url of imagesToDelete) {
      await deleteFromCloudinary(url);
    }

    // Parse JSON strings for nested fields
    const parsedUpdateData = { ...updateData };
    if (typeof updateData.inventory === "string")
      parsedUpdateData.inventory = JSON.parse(updateData.inventory);
    if (
      parsedUpdateData.inventory &&
      Array.isArray(parsedUpdateData.inventory)
    ) {
      parsedUpdateData.inventory = parsedUpdateData.inventory.map((item) => ({
        ...item,
        size: item.size ? item.size.toLowerCase() : item.size,
      }));
    }
    if (typeof updateData.colors === "string")
      parsedUpdateData.colors = JSON.parse(updateData.colors);
    if (typeof updateData.tags === "string")
      parsedUpdateData.tags = JSON.parse(updateData.tags);
    if (typeof updateData.category === "string")
      parsedUpdateData.category = JSON.parse(updateData.category);
    if (updateData.price) parsedUpdateData.price = Number(updateData.price);
    if (updateData.discountPrice)
      parsedUpdateData.discountPrice = Number(updateData.discountPrice);
    if (updateData.discountPercentage)
      parsedUpdateData.discountPercentage = Number(
        updateData.discountPercentage,
      );

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { ...parsedUpdateData, images: newImageUrls },
      { new: true },
    );

    // old slug too, in case this update renamed it
    revalidateStorefront([
      PRODUCTS_TAG,
      productTag(product.slug),
      productTag(updatedProduct.slug),
    ]);

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const url of product.images) {
        await deleteFromCloudinary(url);
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    revalidateStorefront([PRODUCTS_TAG, productTag(product.slug)]);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBestSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ isBestSeller: true })
      .sort({ sold: -1 })
      .limit(4)
      .select("-__v -createdAt -updatedAt");
    if (!products || products.length === 0) {
      return res
        .status(200)
        .json({ success: true, message: "No products found", products: [] });
    }
    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;

    const currentProduct = await Product.findById(id);
    if (!currentProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const products = await Product.aggregate([
      {
        $match: {
          _id: { $ne: currentProduct._id },
          $or: [
            { category: { $in: currentProduct.category } },
            { tags: { $in: currentProduct.tags } },
          ],
        },
      },
      { $sample: { size: 4 } },
      { $project: { __v: 0, createdAt: 0, updatedAt: 0 } },
    ]);

    if (!products || products.length === 0) {
      return res
        .status(200)
        .json({
          success: true,
          message: "No related products found",
          products: [],
        });
    }

    res.status(200).json({
      success: true,
      message: "Related products fetched successfully",
      products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
