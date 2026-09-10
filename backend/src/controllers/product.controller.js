const prisma = require("../config/prisma");
const { v4: uuidv4 } = require("uuid");
const QRCode = require("qrcode");

const optionalDate = value => value ? new Date(value) : null;

// Create Product
const createProduct = async (req, res) => {
    try {
        const {
            productName,
            category,
            brand,
            variant,
            productCode,
            barcode,
            description,
            netQuantity,
            unitOfMeasure,
            countryOfOrigin,
            expiryDate,
            attributes,
            rawMaterialSource,
            supplier,
            processingPlant,
            processingDate,
            qualityCheck,
            packagingUnit,
            packagingDate,
            warehouse,
            distributor,
            retailer,
            location,
            dispatchDate,
            deliveryDate,
            temperature,
        } = req.body;

        if (!productName || productName.trim().length < 2) {
            return res.status(400).json({success: false, message: "Product name is required"});
        }
        
        const qrValue = uuidv4();
        const publicBaseUrl = (
            process.env.PUBLIC_BASE_URL
            || process.env.RENDER_EXTERNAL_URL
            || `${req.protocol}://${req.get("host")}`
        ).replace(/\/$/, "");
        const verificationUrl = `${publicBaseUrl}/verify/${qrValue}`;
        const qrImage = await QRCode.toDataURL(verificationUrl);
        
        // Today's Date

        const today = new Date();

        const year = today.getFullYear();

        const month = String(today.getMonth()+1).padStart(2,"0");

        const day = String(today.getDate()).padStart(2,"0");

        const date = `${year}${month}${day}`;

        // Collision-resistant public batch identifier. Database count-based IDs
        // race when multiple API instances create products concurrently.
        const batchNumber = `FD-${date}-${qrValue.slice(0, 8).toUpperCase()}`;
        const processingAt = optionalDate(processingDate);
        const packagingAt = optionalDate(packagingDate);
        const dispatchAt = optionalDate(dispatchDate);
        const deliveryAt = optionalDate(deliveryDate);
        const expiryAt = optionalDate(expiryDate);
        const parsedTemperature = temperature !== undefined && temperature !== "" ? Number(temperature) : null;

        const status = retailer ? "RETAIL"
            : distributor ? "DISTRIBUTED"
            : warehouse ? "WAREHOUSE"
            : packagingUnit ? "PACKAGED"
            : qualityCheck ? "QUALITY_CHECK"
            : processingPlant ? "MANUFACTURED"
            : "CREATED";

        const defaultLocation = location?.trim() || "Location not specified";

        const product = await prisma.$transaction(async tx => {
            const createdProduct = await tx.product.create({
                data: {
                    productName: productName.trim(),
                    category: category?.trim() || "GENERAL",
                    brand: brand?.trim() || null,
                    variant: variant?.trim() || null,
                    productCode: productCode?.trim() || null,
                    barcode: barcode?.trim() || null,
                    batchNumber,
                    description: description?.trim() || null,
                    netQuantity: netQuantity !== undefined && netQuantity !== "" ? netQuantity : null,
                    unitOfMeasure: unitOfMeasure?.trim() || null,
                    countryOfOrigin: countryOfOrigin?.trim() || null,
                    expiryDate: expiryAt,
                    attributes: attributes || undefined,
                    qrCode: qrValue,
                    qrImage,
                    status,
                    rawMaterialSource: rawMaterialSource?.trim() || null,
                    supplier: supplier?.trim() || null,
                    processingPlant: processingPlant?.trim() || null,
                    processingDate: processingAt,
                    qualityCheck: qualityCheck?.trim() || null,
                    packagingUnit: packagingUnit?.trim() || null,
                    packagingDate: packagingAt,
                    warehouse: warehouse?.trim() || null,
                    distributor: distributor?.trim() || null,
                    retailer: retailer?.trim() || null,
                    location: location?.trim() || null,
                    dispatchDate: dispatchAt,
                    deliveryDate: deliveryAt,
                    temperature: Number.isFinite(parsedTemperature) ? parsedTemperature : null,
                    manufacturerId: req.user.id,
                },
            });

            const traces = [
            {
                stage: "CREATED",
                location: rawMaterialSource?.trim() || defaultLocation,
                eventDate: processingAt || new Date(),
                remarks: rawMaterialSource ? `Raw materials sourced from ${rawMaterialSource}` : "Product record created",
            },
            processingPlant && {
                stage: "PROCESSING",
                location: processingPlant.trim(),
                eventDate: processingAt,
                remarks: `Processed at ${processingPlant}`,
            },
            qualityCheck && {
                stage: "QUALITY_CHECK",
                location: processingPlant?.trim() || defaultLocation,
                eventDate: processingAt,
                remarks: qualityCheck.trim(),
            },
            packagingUnit && {
                stage: "PACKAGED",
                location: packagingUnit.trim(),
                eventDate: packagingAt,
                remarks: `Packaged by ${packagingUnit}`,
            },
            warehouse && {
                stage: "WAREHOUSE",
                location: warehouse.trim(),
                eventDate: packagingAt,
                remarks: `Stored at ${warehouse}`,
            },
            distributor && {
                stage: "DISTRIBUTED",
                location: distributor.trim(),
                eventDate: dispatchAt,
                remarks: `Dispatched through ${distributor}`,
            },
            retailer && {
                stage: "RETAIL",
                location: retailer.trim(),
                eventDate: deliveryAt,
                remarks: `Delivered to ${retailer}`,
            },
            ].filter(Boolean).map(trace => ({
                ...trace,
                temperature: Number.isFinite(parsedTemperature) ? parsedTemperature : null,
                productId: createdProduct.id,
                updatedById: req.user.id,
            }));

            await tx.trace.createMany({data: traces});
            await tx.notification.create({
                data: {
                    type: "PRODUCT_CREATED",
                    severity: "SUCCESS",
                    title: "Product registered",
                    message: `${createdProduct.productName} batch ${createdProduct.batchNumber} is ready for traceability.`,
                    metadata: {status: createdProduct.status, category: createdProduct.category},
                    userId: req.user.id,
                    productId: createdProduct.id,
                },
            });
            return createdProduct;
        });

        res.status(201).json({
            success:true,
            message:"Product Created Successfully",
            product: {...product, verificationUrl},
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

            where: req.user.role === "MANUFACTURER" ? {manufacturerId: req.user.id} : undefined,

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

        const ownedProduct = await prisma.product.findFirst({where: {id: req.params.id, manufacturerId: req.user.id}});
        if (!ownedProduct) return res.status(404).json({message: "Product not found in your workspace"});

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

        const ownedProduct = await prisma.product.findFirst({where: {id: req.params.id, manufacturerId: req.user.id}});
        if (!ownedProduct) return res.status(404).json({message: "Product not found in your workspace"});

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

        const product = await prisma.product.findFirst({
            where: {
                OR: [
                    {qrCode: qr},
                    {barcode: qr},
                    {productCode: qr},
                    {batchNumber: qr},
                ],
            },

            select: {
                id: true,
                productName: true,
                category: true,
                brand: true,
                variant: true,
                productCode: true,
                barcode: true,
                batchNumber: true,
                description: true,
                netQuantity: true,
                unitOfMeasure: true,
                countryOfOrigin: true,
                expiryDate: true,
                attributes: true,
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
