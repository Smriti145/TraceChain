const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const csvPath = path.join(
  __dirname,
  "..",
  "data",
  "maize_whole_journey_india.csv"
);

function readCSV() {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on("data", (row) => results.push(row))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

function parseDate(value) {
  if (!value || value.trim() === "") {
    return null;
  }

  return new Date(value);
}

async function main() {
  console.log("🌽 Starting Maize Dataset Import...\n");

  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found at: ${csvPath}`);
  }

  const records = await readCSV();

  console.log(`📄 Records found in CSV: ${records.length}\n`);

  /*
   * We need an existing User because Product.manufacturerId
   * is required by your current database schema.
   *
   * We'll use the first existing user as the demo manufacturer.
   */
const bcrypt = require("bcrypt");

let manufacturer = await prisma.user.findFirst({
  where: {
    role: "MANUFACTURER",
  },
});

if (!manufacturer) {
  const hashedPassword = await bcrypt.hash(
    "TraceChain@123",
    10
  );

  manufacturer = await prisma.user.create({
    data: {
      name: "TraceChain Demo Manufacturer",
      email: "manufacturer@tracechain.demo",
      password: hashedPassword,
      role: "MANUFACTURER",
    },
  });

  console.log("👤 Created demo manufacturer user");
} else {
  console.log(`👤 Using existing manufacturer: ${manufacturer.email}`);
}

console.log();

  let importedProducts = 0;
  let importedTraces = 0;

  for (const row of records) {
    const batchId = row["Batch ID"];
    const qrId = row["Traceability/QR ID"];

    console.log(`Processing ${batchId} (${qrId})...`);

    /*
     * Determine product status from the CSV.
     */
    let status = "CREATED";

    switch (row["Current Status"]) {
      case "Quality Check":
        status = "QUALITY_CHECK";
        break;

      case "In Transit":
        status = "IN_TRANSIT";
        break;

      case "Delivered":
        status = "DELIVERED";
        break;

      default:
        status = "CREATED";
    }

    /*
     * Create or update the Product.
     */
    const product = await prisma.product.upsert({
      where: {
        batchNumber: batchId,
      },

      update: {
        productName: row["Product Name"],
        productCode: row["Product ID"],
        qrCode: qrId,

        status,

        rawMaterialSource: row["Raw Material Source"],
        supplier: row["Supplier"],
        processingPlant: row["Processing Plant"],
        processingDate: parseDate(row["Processing Date"]),

        qualityCheck: row["Quality Check"],

        packagingUnit: row["Packaging Unit"],
        packagingDate: parseDate(row["Packaging Date"]),

        warehouse: row["Warehouse"],
        distributor: row["Distributor"],
        retailer: row["Retailer"],
        location: row["Location"],

        dispatchDate: parseDate(row["Dispatch Date"]),
        deliveryDate: parseDate(row["Delivery Date"]),

        temperature: row["Temperature (°C)"]
          ? Number(row["Temperature (°C)"])
          : null,
      },

      create: {
        productName: row["Product Name"],
        productCode: row["Product ID"],
        batchNumber: batchId,

        description: "Maize traceability product",

        qrCode: qrId,

        status,

        rawMaterialSource: row["Raw Material Source"],
        supplier: row["Supplier"],
        processingPlant: row["Processing Plant"],
        processingDate: parseDate(row["Processing Date"]),

        qualityCheck: row["Quality Check"],

        packagingUnit: row["Packaging Unit"],
        packagingDate: parseDate(row["Packaging Date"]),

        warehouse: row["Warehouse"],
        distributor: row["Distributor"],
        retailer: row["Retailer"],
        location: row["Location"],

        dispatchDate: parseDate(row["Dispatch Date"]),
        deliveryDate: parseDate(row["Delivery Date"]),

        temperature: row["Temperature (°C)"]
          ? Number(row["Temperature (°C)"])
          : null,

        manufacturerId: manufacturer.id,
      },
    });

    importedProducts++;

    /*
     * Remove previously imported traces for this product.
     *
     * This makes the seed script safe to run multiple times.
     */
    await prisma.trace.deleteMany({
      where: {
        productId: product.id,
      },
    });

    /*
     * Build the product journey.
     */

    const traces = [];

    // 1. Raw Material
    traces.push({
      stage: "RAW_MATERIAL",
      location: row["Raw Material Source"],
      eventDate: parseDate(row["Processing Date"]),
      temperature: row["Temperature (°C)"]
        ? Number(row["Temperature (°C)"])
        : null,
      remarks: `Raw maize sourced from ${row["Raw Material Source"]}`,
    });

    // 2. Processing
    traces.push({
      stage: "PROCESSING",
      location: row["Processing Plant"],
      eventDate: parseDate(row["Processing Date"]),
      temperature: row["Temperature (°C)"]
        ? Number(row["Temperature (°C)"])
        : null,
      remarks: `Processed at ${row["Processing Plant"]}`,
    });

    // 3. Quality Check
    traces.push({
      stage: "QUALITY_CHECK",
      location: row["Processing Plant"],
      eventDate: parseDate(row["Processing Date"]),
      temperature: row["Temperature (°C)"]
        ? Number(row["Temperature (°C)"])
        : null,
      remarks: `Quality check status: ${row["Quality Check"]}`,
    });

    // 4. Packaging
    traces.push({
      stage: "PACKAGING",
      location: row["Packaging Unit"],
      eventDate: parseDate(row["Packaging Date"]),
      temperature: row["Temperature (°C)"]
        ? Number(row["Temperature (°C)"])
        : null,
      remarks: `Packed at ${row["Packaging Unit"]}`,
    });

    // 5. Warehouse
    traces.push({
      stage: "WAREHOUSE",
      location: row["Warehouse"],
      eventDate: parseDate(row["Packaging Date"]),
      temperature: row["Temperature (°C)"]
        ? Number(row["Temperature (°C)"])
        : null,
      remarks: `Stored at ${row["Warehouse"]}`,
    });

    // 6. Distribution
    traces.push({
      stage: "DISTRIBUTION",
      location: row["Distributor"],
      eventDate: parseDate(row["Dispatch Date"]),
      temperature: row["Temperature (°C)"]
        ? Number(row["Temperature (°C)"])
        : null,
      remarks: `Dispatched through ${row["Distributor"]}`,
    });

    // 7. Retail
    traces.push({
      stage: "RETAIL",
      location: row["Retailer"],
      eventDate: parseDate(row["Delivery Date"]),
      temperature: row["Temperature (°C)"]
        ? Number(row["Temperature (°C)"])
        : null,
      remarks: `Delivered to ${row["Retailer"]}`,
    });

    // 8. Delivery
    if (row["Delivery Date"]) {
      traces.push({
        stage: "DELIVERY",
        location: row["Location"],
        eventDate: parseDate(row["Delivery Date"]),
        temperature: row["Temperature (°C)"]
          ? Number(row["Temperature (°C)"])
          : null,
        remarks: `Product delivered to ${row["Location"]}`,
      });
    }

    /*
     * Insert all journey events.
     */
    for (const trace of traces) {
      await prisma.trace.create({
        data: {
          stage: trace.stage,
          location: trace.location,
          eventDate: trace.eventDate,
          temperature: trace.temperature,
          remarks: trace.remarks,

          productId: product.id,
          updatedById: manufacturer.id,
        },
      });

      importedTraces++;
    }

    console.log(`   ✓ Product imported`);
    console.log(`   ✓ ${traces.length} journey events created\n`);
  }

  console.log("========================================");
  console.log("🌽 MAIZE IMPORT COMPLETED");
  console.log("========================================");
  console.log(`Products imported : ${importedProducts}`);
  console.log(`Trace events      : ${importedTraces}`);
  console.log("========================================");
}

main()
  .catch((error) => {
    console.error("\n❌ Import failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });