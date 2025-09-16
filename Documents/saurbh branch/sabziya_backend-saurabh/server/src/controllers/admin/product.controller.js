const { product, product_image, product_synonym } = require("../../models");
const {
  productValidationSchema,
  synonymValidationSchema,
  productImageValidationSchema,
} = require("../../validations/product.validation");

// CREATE PRODUCT
exports.createProduct = async (req, res) => {
  try {
    // const { error } = productValidationSchema.validate(req.body);
    // if (error)
    //   return res.status(400).json({ message: error.details[0].message });

    const newProduct = await product.create(req.body);
    res.status(201).json({ message: "Product created", data: newProduct });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
  try {
    const { error } = productValidationSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { id } = req.params;
    const existing = await product.findByPk(id);
    if (!existing)
      return res.status(404).json({ message: "Product not found" });

    await existing.update(req.body);
    res.json({ message: "Product updated", data: existing });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE PRODUCT (Soft Delete)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await product.findByPk(id);
    if (!existing)
      return res.status(404).json({ message: "Product not found" });

    await existing.destroy(); // Soft delete (paranoid: true)
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET ALL PRODUCTS with IMAGES and SYNONYMS
exports.getAllProducts = async (req, res) => {
  try {
    const allProducts = await product.findAll({
      include: [
        { model: product_image, as: "images" },
        { model: product_synonym, as: "synonyms" },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ data: allProducts });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ADD SYNONYMS TO A PRODUCT
exports.addSynonyms = async (req, res) => {
  try {
    const { error } = synonymValidationSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { product_id, synonym } = req.body;
    const productExists = await product.findByPk(product_id);
    if (!productExists)
      return res.status(404).json({ message: "Product not found" });

    const newSynonym = await product_synonym.create({ product_id, synonym });
    res.status(201).json({ message: "Synonym added", data: newSynonym });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ADD IMAGES TO A PRODUCT (MAX 5)
exports.addProductImage = async (req, res) => {
  try {
    const { error } = productImageValidationSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { product_id, image_url } = req.body;
    const productExists = await product.findByPk(product_id);
    if (!productExists)
      return res.status(404).json({ message: "Product not found" });

    const existingImages = await product_image.count({ where: { product_id } });
    if (existingImages >= 5)
      return res
        .status(400)
        .json({ message: "Maximum 5 images allowed per product" });

    const newImage = await product_image.create({ product_id, image_url });
    res.status(201).json({ message: "Image added", data: newImage });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// GET PRODUCT BY ID with IMAGES and SYNONYMS
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const foundProduct = await product.findOne({
      where: { id },
      include: [
        { model: product_image, as: "images" },
        { model: product_synonym, as: "synonyms" },
      ],
    });

    if (!foundProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ data: foundProduct });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
