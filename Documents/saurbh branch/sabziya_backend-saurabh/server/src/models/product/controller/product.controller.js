import { Op } from "sequelize";
import productUpload from "../../../config/productMulter.js";
import db from "../../index.js";
import fs from "fs";
import path from "path";
const { Product, ProductImage, ProductSynonym, ProductCategory, Category } = db;

const cleanupFile = (file) => {
  if (file && file.path && fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }
};

// Create product with single image upload
export const createProduct = async (req, res) => {
  let uploadedFile = null;

  try {
    // Multer puts the single uploaded file on req.file
    const file = req.file;
    uploadedFile = file;

    const {
      p_title,
      p_description,
      price,
      stock_quantity,
      unit,
      status,
      category,
      low_stock_threshold,
    } = req.body;

    // Validate required fields
    if (!p_title || !price) {
      cleanupFile(file);
      return res.status(400).json({
        success: false,
        message: "Product title and price are required",
      });
    }

    // Create product
    const productData = {
      p_title,
      p_description: p_description || "",
      price: parseFloat(price),
      stock_quantity: parseInt(stock_quantity) || 0,
      unit: unit || "kg",
      status: status || "inactive",
      category: category || "",
      low_stock_threshold: parseInt(low_stock_threshold) || 0,
    };

    const newProduct = await Product.create(productData);

    // Save image if uploaded
    if (file) {
      const imageRecord = await ProductImage.create({
        image_url: `/uploads/products/${path.basename(file.path)}`,
        product_id: newProduct.id,
      });

      // Set as main image
      await newProduct.update({ image_url: imageRecord.image_url });
    }

    // Fetch complete product with image
    const completeProduct = await Product.findByPk(newProduct.id, {
      include: [
        {
          model: ProductImage,
          as: "images",
          attributes: ["id", "image_url"],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: completeProduct,
    });
  } catch (error) {
    // Clean up uploaded file if error occurs
    cleanupFile(uploadedFile);

    console.error("Error creating product:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating product",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Product.findByPk(id);

    if (!existing)
      return res.status(404).json({ message: "Product not found" });

    await existing.update(req.body);
    return res.json({ message: "Product updated", data: existing });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Product.findByPk(id);

    if (!existing)
      return res.status(404).json({ message: "Product not found" });

    await existing.destroy(); // soft delete if paranoid: true
    return res.json({ message: "Product deleted" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// GET ALL PRODUCTS with IMAGES and SYNONYMS
// export const getAllProducts = async (req, res) => {
//   try {
//     const {
//       category,
//       minPrice,
//       maxPrice,
//       organic,
//       seasonal,
//       search,
//       sort = "newest",
//       page = 1,
//       limit = 12,
//       status = "active",
//     } = req.query;

//     // Build where clause
//     const whereClause = {
//       status: status,
//     };

//     // Category filter
//     if (category) {
//       whereClause.category = category;
//     }

//     // Price range filter
//     if (minPrice || maxPrice) {
//       whereClause.price = {};
//       if (minPrice) whereClause.price[Op.gte] = parseFloat(minPrice);
//       if (maxPrice) whereClause.price[Op.lte] = parseFloat(maxPrice);
//     }

//     // Organic filter
//     if (organic === "true") {
//       whereClause.is_organic = true;
//     }

//     // Seasonal filter
//     if (seasonal) {
//       whereClause.season = seasonal;
//     }

//     // Search filter
//     if (search) {
//       whereClause[Op.or] = [
//         { p_title: { [Op.iLike]: `%${search}%` } },
//         { p_description: { [Op.iLike]: `%${search}%` } },
//         { "$synonyms.synonym_text$": { [Op.iLike]: `%${search}%` } },
//       ];
//     }

//     // Build order clause
//     let orderClause;
//     switch (sort) {
//       case "price-low":
//         orderClause = [["price", "ASC"]];
//         break;
//       case "price-high":
//         orderClause = [["price", "DESC"]];
//         break;
//       case "name":
//         orderClause = [["p_title", "ASC"]];
//         break;
//       case "popular":
//         orderClause = [["rating", "DESC"]];
//         break;
//       case "newest":
//       default:
//         orderClause = [["createdAt", "DESC"]];
//         break;
//     }

//     // Calculate pagination
//     const offset = (parseInt(page) - 1) * parseInt(limit);
//     const totalProducts = await Product.count({
//       where: whereClause,
//       include: search ? [{ model: ProductSynonym, as: "synonyms" }] : [],
//     });

//     const allProducts = await Product.findAll({
//       where: whereClause,
//       include: [
//         {
//           model: ProductImage,
//           as: "images",
//           attributes: ["id", "image_url", "is_primary"],
//         },
//         {
//           model: ProductSynonym,
//           as: "synonyms",
//           attributes: ["id", "synonym_text"],
//           required: false,
//         },
//         {
//           model: Category,
//           as: "categoryData",
//           attributes: ["id", "name", "description"],
//           required: false,
//         },
//       ],
//       order: orderClause,
//       limit: parseInt(limit),
//       offset: offset,
//       distinct: true, // Important for counting with includes
//     });

//     // Get total pages
//     const totalPages = Math.ceil(totalProducts / parseInt(limit));

//     return res.json({
//       success: true,
//       data: allProducts,
//       pagination: {
//         currentPage: parseInt(page),
//         totalPages: totalPages,
//         totalProducts: totalProducts,
//         hasNext: parseInt(page) < totalPages,
//         hasPrev: parseInt(page) > 1,
//         limit: parseInt(limit),
//       },
//       filters: {
//         category,
//         minPrice: minPrice ? parseFloat(minPrice) : null,
//         maxPrice: maxPrice ? parseFloat(maxPrice) : null,
//         organic: organic === "true",
//         seasonal,
//         search,
//         sort,
//       },
//     });
//   } catch (err) {
//     console.error("Error fetching products:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error while fetching products",
//       error: err.message,
//     });
//   }
// };
// server/src/models/product/controller/product.controller.js

// Get all products with filtering and pagination
export const getAllProducts = async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      organic,
      seasonal,
      search,
      sort = "newest",
      page = 1,
      limit = 12,
      status = "active",
    } = req.query;

    // Build where clause
    const whereClause = {
      status: status,
    };

    // Category filter
    if (category) {
      whereClause.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) whereClause.price[Op.lte] = parseFloat(maxPrice);
    }

    // Organic filter
    if (organic === "true") {
      whereClause.is_organic = true;
    }

    // Seasonal filter
    if (seasonal) {
      whereClause.season = seasonal;
    }

    // Search filter
    if (search) {
      whereClause[Op.or] = [
        { p_title: { [Op.iLike]: `%${search}%` } },
        { p_description: { [Op.iLike]: `%${search}%` } },
        { "$synonyms.synonym_text$": { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Build order clause
    let orderClause;
    switch (sort) {
      case "price-low":
        orderClause = [["price", "ASC"]];
        break;
      case "price-high":
        orderClause = [["price", "DESC"]];
        break;
      case "name":
        orderClause = [["p_title", "ASC"]];
        break;
      case "popular":
        orderClause = [["rating", "DESC"]];
        break;
      case "newest":
      default:
        orderClause = [["createdAt", "DESC"]];
        break;
    }

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const totalProducts = await Product.count({
      where: whereClause,
      include: search ? [{ model: ProductSynonym, as: "synonyms" }] : [],
    });

    const allProducts = await Product.findAll({
      where: whereClause,
      include: [
        {
          model: ProductImage,
          as: "images",
          attributes: ["id", "image_url"], // removed is_primary
        },
        {
          model: ProductSynonym,
          as: "synonyms",
          attributes: ["id", "synonym"],
          required: false,
        },
        {
          model: Category,
          as: "categoryData",
          attributes: ["id", "name", "description"],
          required: false,
        },
      ],
      order: orderClause,
      limit: parseInt(limit),
      offset: offset,
      distinct: true, // Important for counting with includes
    });

    // Get total pages
    const totalPages = Math.ceil(totalProducts / parseInt(limit));

    return res.json({
      success: true,
      data: allProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: totalPages,
        totalProducts: totalProducts,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
        limit: parseInt(limit),
      },
      filters: {
        category,
        minPrice: minPrice ? parseFloat(minPrice) : null,
        maxPrice: maxPrice ? parseFloat(maxPrice) : null,
        organic: organic === "true",
        seasonal,
        search,
        sort,
      },
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching products",
      error: err.message,
    });
  }
};

// Get product by ID with related data
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const foundProduct = await Product.findOne({
      where: {
        id,
        status: "active",
      },
      include: [
        {
          model: ProductImage,
          as: "images",
          attributes: ["id", "image_url", "is_primary", "caption"],
          order: [["is_primary", "DESC"]],
        },
        {
          model: ProductSynonym,
          as: "synonyms",
          attributes: ["id", "synonym_text"],
        },
        {
          model: Category,
          as: "categoryData",
          attributes: ["id", "name", "description", "image_url"],
        },
      ],
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COALESCE(AVG(rating), 0) 
              FROM reviews 
              WHERE product_id = product.id AND status = 'approved'
            )`),
            "average_rating",
          ],
          [
            sequelize.literal(`(
              SELECT COUNT(*) 
              FROM reviews 
              WHERE product_id = product.id AND status = 'approved'
            )`),
            "review_count",
          ],
        ],
      },
    });

    if (!foundProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found or inactive",
      });
    }

    // Get related products
    const relatedProducts = await Product.findAll({
      where: {
        category: foundProduct.category,
        status: "active",
        id: { [Op.ne]: foundProduct.id },
      },
      include: [
        {
          model: ProductImage,
          as: "images",
          attributes: ["image_url"],
          where: { is_primary: true },
          required: false,
        },
      ],
      limit: 4,
      order: sequelize.random(),
    });

    return res.json({
      success: true,
      data: {
        product: foundProduct,
        relatedProducts,
      },
    });
  } catch (err) {
    console.error("Error fetching product:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching product",
      error: err.message,
    });
  }
};

// Get products by category
export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12, sort = "newest" } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build order clause
    let orderClause;
    switch (sort) {
      case "price-low":
        orderClause = [["price", "ASC"]];
        break;
      case "price-high":
        orderClause = [["price", "DESC"]];
        break;
      case "name":
        orderClause = [["p_title", "ASC"]];
        break;
      case "popular":
        orderClause = [["rating", "DESC"]];
        break;
      case "newest":
      default:
        orderClause = [["createdAt", "DESC"]];
        break;
    }

    const { count, rows } = await Product.findAndCountAll({
      where: {
        category: category,
        status: "active",
      },
      include: [
        {
          model: ProductImage,
          as: "images",
          attributes: ["image_url"],
          where: { is_primary: true },
          required: false,
        },
      ],
      order: orderClause,
      limit: parseInt(limit),
      offset: offset,
      distinct: true,
    });

    const totalPages = Math.ceil(count / parseInt(limit));

    return res.json({
      success: true,
      data: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: totalPages,
        totalProducts: count,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.error("Error fetching products by category:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching products by category",
      error: err.message,
    });
  }
};

// Get available filters for products
export const getProductFilters = async (req, res) => {
  try {
    const { category } = req.query;

    const whereClause = {
      status: "active",
    };

    if (category) {
      whereClause.category = category;
    }

    // Get price range
    const priceRange = await Product.findOne({
      where: whereClause,
      attributes: [
        [sequelize.fn("MIN", sequelize.col("price")), "minPrice"],
        [sequelize.fn("MAX", sequelize.col("price")), "maxPrice"],
      ],
    });

    // Get available categories with counts
    const categories = await Product.findAll({
      where: { status: "active" },
      attributes: [
        "category",
        [sequelize.fn("COUNT", sequelize.col("id")), "productCount"],
      ],
      group: ["category"],
      order: [["category", "ASC"]],
    });

    // Get seasonal availability options
    const seasons = await Product.findAll({
      where: { status: "active" },
      attributes: [
        "season",
        [sequelize.fn("COUNT", sequelize.col("id")), "productCount"],
      ],
      group: ["season"],
      having: sequelize.where(sequelize.col("season"), Op.ne, null),
      order: [["season", "ASC"]],
    });

    return res.json({
      success: true,
      data: {
        priceRange: {
          min: parseFloat(priceRange.dataValues.minPrice) || 0,
          max: parseFloat(priceRange.dataValues.maxPrice) || 1000,
        },
        categories: categories.map((cat) => ({
          name: cat.category,
          count: cat.dataValues.productCount,
        })),
        seasons: seasons.map((season) => ({
          name: season.season,
          count: season.dataValues.productCount,
        })),
        organicAvailable:
          (await Product.count({
            where: { ...whereClause, is_organic: true },
          })) > 0,
      },
    });
  } catch (err) {
    console.error("Error fetching product filters:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching product filters",
      error: err.message,
    });
  }
};
// GET PRODUCT BY ID
// export const getProductById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const foundProduct = await Product.findOne({
//       where: { id },
//       include: [
//         { model: ProductImage, as: "images" },
//         { model: ProductSynonym, as: "synonyms" },
//       ],
//     });

//     if (!foundProduct)
//       return res.status(404).json({ message: "Product not found" });

//     return res.json({ data: foundProduct });
//   } catch (err) {
//     return res
//       .status(500)
//       .json({ message: "Server error", error: err.message });
//   }
// };

// ADD SYNONYM
// export const addSynonyms = async (req, res) => {
//   try {
//     const { product_id, synonyms } = req.body; // expect an array of synonyms

//     const productExists = await Product.findByPk(product_id);
//     if (!productExists) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     if (!Array.isArray(synonyms) || synonyms.length === 0) {
//       return res
//         .status(400)
//         .json({ message: "Synonyms must be a non-empty array" });
//     }

//     // Insert all synonyms in bulk
//     const newSynonyms = await ProductSynonym.bulkCreate(
//       synonyms.map((synonym) => ({
//         product_id,
//         synonym,
//       }))
//     );

//     return res.status(201).json({
//       message: "Synonyms added",
//       data: newSynonyms,
//     });
//   } catch (err) {
//     return res.status(500).json({
//       message: "Server error",
//       error: err.message,
//     });
//   }
// };

export const addSynonyms = async (req, res) => {
  try {
    const { product_id, synonyms } = req.body;

    const productExists = await Product.findByPk(product_id);
    if (!productExists) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!Array.isArray(synonyms) || synonyms.length === 0) {
      return res
        .status(400)
        .json({ message: "Synonyms must be a non-empty array" });
    }

    // Filter out duplicates
    const uniqueSynonyms = [...new Set(synonyms.map((s) => s.trim()))];

    const newSynonyms = await ProductSynonym.bulkCreate(
      uniqueSynonyms.map((synonym) => ({
        product_id,
        synonym,
      })),
      { ignoreDuplicates: true } // works only if you add a unique index in DB
    );

    return res.status(201).json({
      message: "Synonyms added successfully",
      data: newSynonyms,
    });
  } catch (err) {
    console.error("Error in addSynonyms:", err); // 👈 log full error in backend
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// ADD PRODUCT IMAGE (no validation on count)
export const addProductImage = async (req, res) => {
  try {
    const { product_id, image_urls } = req.body; // image_urls should be an array of URLs

    console.log("Product Id:", product_id);
    console.log("Image URLs:", image_urls);

    // Check product exists
    const productExists = await Product.findByPk(product_id);
    if (!productExists) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Validate input
    if (!Array.isArray(image_urls) || image_urls.length === 0) {
      return res
        .status(400)
        .json({ message: "image_urls must be a non-empty array" });
    }

    // Bulk insert images
    const newImages = await ProductImage.bulkCreate(
      image_urls.map((url) => ({ product_id, image_url: url }))
    );

    return res.status(201).json({ message: "Images added", data: newImages });
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

export const assignCategoryToProduct = async (req, res) => {
  try {
    const { product_id, category_id, added_by } = req.body;

    // 1️⃣ Validate if product exists
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 2️⃣ Validate if category exists
    const category = await Category.findByPk(category_id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // 3️⃣ Check if mapping already exists
    const existingMapping = await ProductCategory.findOne({
      where: { product_id, category_id },
    });

    if (existingMapping) {
      return res
        .status(400)
        .json({ message: "This product is already assigned to this category" });
    }

    // 4️⃣ Create mapping
    const productCategory = await ProductCategory.create({
      product_id,
      category_id,
      added_by,
    });

    return res.status(201).json({
      message: "Category assigned to product successfully",
      data: productCategory,
    });
  } catch (error) {
    console.error("Error assigning category to product:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// import productImage from '../models/productImage.model.js'
// import Product from '../models/product.model.js'
// import productSynonym from '../models/productSynonym.model.js'
// import validateProductFields from '../../../utils/validateProduct.js';
// // CREATE PRODUCT
// export const createProduct = async (req, res) => {
//   try {
//   const errors = validateProductFields(req.body);
//   if (errors.length > 0) {
//     return res.status(400).json({ message: "Validation errors", errors });
//   }
//     const newProduct = await Product.create(req.body);
//     return res.status(201).json({ message: "Product created", data: newProduct });
//   } catch (err) {
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // UPDATE PRODUCT
// export const updateProduct = async (req, res) => {
//   try {
//     const errors = validateProductFields(req.body);
//     if (errors.length > 0) {
//       return res.status(400).json({ message: "Validation errors", errors });
//     }

//     const { id } = req.params;
//     const existing = await product.findByPk(id);

//     if (!existing) return res.status(404).json({ message: "Product not found" });

//     await existing.update(req.body);
//     return res.json({ message: "Product updated", data: existing });
//   } catch (err) {
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // DELETE PRODUCT (Soft Delete)
// export const deleteProduct = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const existing = await product.findByPk(id);

//     if (!existing) return res.status(404).json({ message: "Product not found" });

//     await existing.destroy(); // soft delete with paranoid: true
//     return res.json({ message: "Product deleted" });
//   } catch (err) {
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // GET ALL PRODUCTS with IMAGES and SYNONYMS
// export const getAllProducts = async (_req, res) => {
//   try {
//     const allProducts = await product.findAll({
//       include: [
//         { model: productImage, as: "images" },
//         { model: productSynonym, as: "synonyms" },
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     return res.json({ data: allProducts });
//   } catch (err) {
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // GET PRODUCT BY ID
// export const getProductById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const foundProduct = await product.findOne({
//       where: { id },
//       include: [
//         { model: productImage, as: "images" },
//         { model: productSynonym, as: "synonyms" },
//       ],
//     });

//     if (!foundProduct) return res.status(404).json({ message: "Product not found" });

//     return res.json({ data: foundProduct });
//   } catch (err) {
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // ADD SYNONYMS TO A PRODUCT
// export const addSynonyms = async (req, res) => {
//   try {
//     const { error } = synonymValidationSchema.validate(req.body);
//     if (error) return res.status(400).json({ message: error.details[0].message });

//     const { product_id, synonym } = req.body;

//     const productExists = await product.findByPk(product_id);
//     if (!productExists) return res.status(404).json({ message: "Product not found" });

//     const newSynonym = await productSynonym.create({ product_id, synonym });

//     return res.status(201).json({ message: "Synonym added", data: newSynonym });
//   } catch (err) {
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // ADD IMAGE TO PRODUCT (MAX 5)
// export const addProductImage = async (req, res) => {
//   try {
//     const { error } = productImageValidationSchema.validate(req.body);
//     if (error) return res.status(400).json({ message: error.details[0].message });

//     const { product_id, image_url } = req.body;

//     const productExists = await product.findByPk(product_id);
//     if (!productExists) return res.status(404).json({ message: "Product not found" });

//     const imageCount = await productImage.count({ where: { product_id } });
//     if (imageCount >= 5) {
//       return res.status(400).json({ message: "Maximum 5 images allowed per product" });
//     }

//     const newImage = await productImage.create({ product_id, image_url });
//     return res.status(201).json({ message: "Image added", data: newImage });
//   } catch (err) {
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };
