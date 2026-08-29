const prisma = require("../config/prisma");
const { v4: uuidv4 } = require("uuid");
const QRCode = require("qrcode");
// Create Product
const createProduct = async (req, res) => {
    try {
        const {
            productName,
            description,
        } = req.body;
        
        const qrValue = uuidv4();

        const qrImage = await QRCode.toDataURL(qrValue);
        
        // Today's Date

        const today = new Date();

        const year = today.getFullYear();

        const month = String(today.getMonth()+1).padStart(2,"0");

        const day = String(today.getDate()).padStart(2,"0");

        const date = `${year}${month}${day}`;

        // Count Products
        const totalProducts = await prisma.product.count();

        // Next Number
        const next = String(totalProducts+1).padStart(4,"0");

        // Final Batch Number
        const batchNumber = `FD-${date}-${next}`;
        const product = await prisma.product.create({
            
            
            data: {
                productName,
                batchNumber,
                description,
                qrCode: qrValue,
                qrImage: qrImage,
                status: "CREATED",
                manufacturerId: req.user.id,
            },
        });

        res.status(201).json({
            success:true,
            message:"Product Created Successfully",
            product
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

// Get All Products

const getProducts = async (req, res) => {

    try {

        const products = await prisma.product.findMany({

            include: {
                manufacturer: {
                    select: { id: true, name: true, email: true, role: true },
                },
            }

        });

        res.json(products);

    } catch (err) {

        res.status(500).json({
            message: err.message,
        });

    }

};

// Get Product

const getProduct = async (req, res) => {

    try {

        const product = await prisma.product.findUnique({

            where: {

                id: req.params.id,

            },

            include: {

                traces: true,

                manufacturer: {
                    select: { id: true, name: true, email: true, role: true },
                },

            },

        });

        if (!product) {

            return res.status(404).json({

                message: "Product not found",

            });

        }

        res.json(product);

    } catch (err) {

        res.status(500).json({

            message: err.message,

        });

    }

};

// Update Product

const updateProduct = async (req, res) => {

    try {

        const product = await prisma.product.update({

            where: {

                id: req.params.id,

            },

            data: req.body,

        });

        res.json(product);

    } catch (err) {

        res.status(500).json({

            message: err.message,

        });

    }

};

// Delete Product

const deleteProduct = async (req, res) => {

    try {

        await prisma.product.delete({

            where: {

                id: req.params.id,

            },

        });

        res.json({

            message: "Product Deleted",

        });

    } catch (err) {

        res.status(500).json({

            message: err.message,

        });

    }

};

    const verifyProduct = async (req, res) => {
    try {
        const qr = req.params.qr;

        const product = await prisma.product.findUnique({
            where: {
                qrCode: qr,
            },

            select: {
                id: true,
                productName: true,
                productCode: true,
                batchNumber: true,
                description: true,
                qrCode: true,
                qrImage: true,
                status: true,

                rawMaterialSource: true,
                supplier: true,
                processingPlant: true,
                processingDate: true,
                qualityCheck: true,

                packagingUnit: true,
                packagingDate: true,

                warehouse: true,
                distributor: true,
                retailer: true,
                location: true,

                dispatchDate: true,
                deliveryDate: true,

                temperature: true,
                createdAt: true,

                manufacturer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },

                traces: {
                    orderBy: {
                        eventDate: "asc",
                    },

                    select: {
                        id: true,
                        stage: true,
                        location: true,
                        latitude: true,
                        longitude: true,
                        eventDate: true,
                        temperature: true,
                        remarks: true,
                        createdAt: true,
                    },
                },
            },
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        res.json({
            success: true,
            product,
        });

    } catch (err) {
        console.error("QR verification error:", err);

        res.status(500).json({
            success: false,
            message: "Failed to verify product",
        });
    }
};

module.exports = {

    createProduct,

    getProducts,

    getProduct,

    updateProduct,

    deleteProduct,

    verifyProduct

};
