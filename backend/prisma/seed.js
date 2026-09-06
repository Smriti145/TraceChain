require("dotenv").config();
const bcrypt = require("bcrypt");
const QRCode = require("qrcode");
const {PrismaClient} = require("@prisma/client");

const prisma = new PrismaClient();
const publicBaseUrl = (process.env.PUBLIC_BASE_URL || "http://localhost:5001").replace(/\/$/, "");

const catalog = [
  {
    productName: "Ashwagandha Wellness Capsules", category: "Ayurveda & Wellness", brand: "Fandoro Naturals", variant: "60 vegetarian capsules",
    productCode: "AYU-ASH-060", barcode: "8901234500017", batchNumber: "DEMO-AYU-2026-001", qrCode: "DEMO-QR-AYURVEDA-001",
    description: "Herbal wellness supplement with ingredient-to-retail provenance.", netQuantity: 60, unitOfMeasure: "capsules", countryOfOrigin: "India", expiryDate: "2028-06-30",
    rawMaterialSource: "Herb growers cooperative, Neemuch, Madhya Pradesh", supplier: "MP Herbal Producers Cooperative", processingPlant: "GMP Herbal Processing Unit, Indore",
    qualityCheck: "Identity, microbial and heavy-metal tests passed", packagingUnit: "Fandoro Wellness Packaging, Indore", warehouse: "Central Wellness Warehouse, Bhopal",
    distributor: "National Wellness Distribution Network", retailer: "Verified Ayurveda Retail Partner", location: "Mumbai, Maharashtra", temperature: 24,
    attributes: {certification: "GMP", form: "Capsule", allergenStatement: "See package"},
  },
  {
    productName: "Cold-Pressed Mustard Oil", category: "Food & Beverage", brand: "Harvest Route", variant: "1 litre bottle",
    productCode: "FOOD-MUST-1L", barcode: "8901234500024", batchNumber: "DEMO-FOOD-2026-001", qrCode: "DEMO-QR-FOOD-001",
    description: "Food-grade oil traced from seed procurement through retail delivery.", netQuantity: 1, unitOfMeasure: "L", countryOfOrigin: "India", expiryDate: "2027-04-30",
    rawMaterialSource: "Mustard farms, Bharatpur, Rajasthan", supplier: "Bharatpur Oilseed Farmer Producer Company", processingPlant: "Cold Press Facility, Jaipur",
    qualityCheck: "FSSAI quality parameters passed", packagingUnit: "Food Safe Bottling Line, Jaipur", warehouse: "North India Food Warehouse, Gurugram",
    distributor: "Harvest Route Foods Distribution", retailer: "Verified Grocery Partner", location: "Delhi NCR", temperature: 22,
    attributes: {process: "Cold pressed", foodLicense: "Demo FSSAI record"},
  },
  {
    productName: "Paracetamol Tablets 500 mg", category: "Pharmaceutical", brand: "MediRoute", variant: "10 tablet blister",
    productCode: "PHARMA-PCM-500", barcode: "8901234500031", batchNumber: "DEMO-PHARMA-2026-001", qrCode: "DEMO-QR-PHARMA-001",
    description: "Demonstration pharmaceutical batch with controlled manufacturing trail.", netQuantity: 10, unitOfMeasure: "tablets", countryOfOrigin: "India", expiryDate: "2028-02-29",
    rawMaterialSource: "Qualified API supplier, Hyderabad", supplier: "Certified Pharma Ingredients Ltd", processingPlant: "GMP Formulation Facility, Hyderabad",
    qualityCheck: "Assay, dissolution and stability checks passed", packagingUnit: "Validated Blister Line 04", warehouse: "Temperature-Controlled Pharma Warehouse, Pune",
    distributor: "Licensed Medical Distributor", retailer: "Registered Pharmacy Partner", location: "Pune, Maharashtra", temperature: 21,
    attributes: {strength: "500 mg", storage: "Store below 25°C", regulatoryClass: "Demo only"},
  },
  {
    productName: "Organic Cotton Shirt", category: "Textile & Apparel", brand: "Ethical Loom", variant: "Blue / Medium",
    productCode: "TEXT-SHIRT-BLU-M", barcode: "8901234500048", batchNumber: "DEMO-TEXTILE-2026-001", qrCode: "DEMO-QR-TEXTILE-001",
    description: "Garment journey from certified cotton source to retail outlet.", netQuantity: 1, unitOfMeasure: "piece", countryOfOrigin: "India",
    rawMaterialSource: "Organic cotton farms, Wardha, Maharashtra", supplier: "Wardha Organic Cotton Cooperative", processingPlant: "Spinning and Garment Unit, Ahmedabad",
    qualityCheck: "Fabric strength, colour fastness and stitching inspection passed", packagingUnit: "Sustainable Apparel Packing Unit", warehouse: "Western Apparel Distribution Centre",
    distributor: "Ethical Loom Retail Logistics", retailer: "Ethical Fashion Store", location: "Bengaluru, Karnataka",
    attributes: {material: "100% organic cotton", certification: "Demo GOTS record", color: "Blue"},
  },
  {
    productName: "Smart Temperature Sensor", category: "Electronics", brand: "TraceSense", variant: "TS-100 Industrial",
    productCode: "ELEC-TS-100", barcode: "8901234500055", batchNumber: "DEMO-ELEC-2026-001", qrCode: "DEMO-QR-ELECTRONICS-001",
    description: "Industrial IoT sensor with component and assembly provenance.", netQuantity: 1, unitOfMeasure: "unit", countryOfOrigin: "India",
    rawMaterialSource: "Approved electronic component vendors", supplier: "TraceSense Component Network", processingPlant: "Electronics Assembly Facility, Noida",
    qualityCheck: "Calibration, electrical safety and burn-in tests passed", packagingUnit: "ESD-Safe Packaging Line", warehouse: "Technology Fulfilment Centre, Noida",
    distributor: "Industrial Electronics Distribution Ltd", retailer: "Authorized Industrial Reseller", location: "Chennai, Tamil Nadu",
    attributes: {model: "TS-100", accuracy: "±0.3°C", warrantyMonths: 24},
  },
  {
    productName: "Aloe Vera Face Gel", category: "Cosmetics", brand: "PureLeaf", variant: "100 ml jar",
    productCode: "COS-ALOE-100", barcode: "8901234500062", batchNumber: "DEMO-COSMETIC-2026-001", qrCode: "DEMO-QR-COSMETICS-001",
    description: "Cosmetic product with ingredient, quality and distribution traceability.", netQuantity: 100, unitOfMeasure: "ml", countryOfOrigin: "India", expiryDate: "2027-12-31",
    rawMaterialSource: "Aloe cultivation cluster, Tamil Nadu", supplier: "Pure Botanical Ingredients Cooperative", processingPlant: "Cosmetic Manufacturing Facility, Chennai",
    qualityCheck: "Microbial, stability and packaging compatibility tests passed", packagingUnit: "PureLeaf Cosmetic Packaging Unit", warehouse: "South Consumer Goods Warehouse",
    distributor: "PureLeaf Beauty Distribution", retailer: "Verified Beauty Retail Partner", location: "Kochi, Kerala", temperature: 23,
    attributes: {skinType: "All skin types", packaging: "Recyclable jar"},
  },
];

const asDate = value => value ? new Date(`${value}T00:00:00.000Z`) : null;

async function main() {
  const password = await bcrypt.hash("TraceChain@123", 10);
  const manufacturer = await prisma.user.upsert({
    where: {email: "manufacturer@tracechain.demo"}, update: {},
    create: {name: "TraceChain Demo Manufacturer", email: "manufacturer@tracechain.demo", password, role: "MANUFACTURER"},
  });

  for (const [index, item] of catalog.entries()) {
    const processingDate = new Date(Date.UTC(2026, 7, 1 + index * 2));
    const packagingDate = new Date(Date.UTC(2026, 7, 2 + index * 2));
    const dispatchDate = new Date(Date.UTC(2026, 7, 3 + index * 2));
    const deliveryDate = new Date(Date.UTC(2026, 7, 5 + index * 2));
    const qrImage = await QRCode.toDataURL(`${publicBaseUrl}/verify/${item.qrCode}`);
    const data = {...item, expiryDate: asDate(item.expiryDate), processingDate, packagingDate, dispatchDate, deliveryDate, qrImage, status: "DELIVERED"};

    const product = await prisma.product.upsert({
      where: {productCode: item.productCode}, update: data,
      create: {...data, manufacturerId: manufacturer.id},
    });

    const events = [
      ["SOURCE", item.rawMaterialSource, processingDate, "Materials sourced from an approved origin"],
      ["MANUFACTURED", item.processingPlant, processingDate, `Manufactured by ${item.processingPlant}`],
      ["QUALITY_CHECK", item.processingPlant, processingDate, item.qualityCheck],
      ["PACKAGED", item.packagingUnit, packagingDate, `Packaged by ${item.packagingUnit}`],
      ["DISTRIBUTED", item.warehouse, dispatchDate, `Dispatched through ${item.distributor}`],
      ["DELIVERED", item.location, deliveryDate, `Delivered to ${item.retailer}`],
    ];

    await prisma.$transaction([
      prisma.trace.deleteMany({where: {productId: product.id}}),
      prisma.trace.createMany({data: events.map(([stage, eventLocation, eventDate, remarks]) => ({
        stage, location: eventLocation, eventDate, remarks, temperature: item.temperature || null,
        productId: product.id, updatedById: manufacturer.id,
      }))}),
    ]);
  }

  console.log(`Seeded ${catalog.length} products across ${new Set(catalog.map(item => item.category)).size} categories.`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => prisma.$disconnect());
