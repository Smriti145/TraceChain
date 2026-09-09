const prisma = require("../config/prisma");

const roleStages = Object.freeze({
  MANUFACTURER: ["MANUFACTURED", "QUALITY_CHECK", "PACKAGED"],
  SUPPLIER: ["SOURCED", "SUPPLIED"],
  WAREHOUSE: ["WAREHOUSE"],
  DISTRIBUTOR: ["IN_TRANSIT", "DISTRIBUTED"],
  RETAILER: ["RETAIL", "SOLD"],
  CUSTOMER: [],
});

const addTrace = async (req, res) => {
  try {
    const {productId, stage, location, latitude, longitude, temperature, remarks} = req.body;
    const permittedStages = roleStages[req.user.role] || [];
    if (!permittedStages.includes(stage)) {
      return res.status(403).json({success: false, message: `${req.user.role} cannot record the ${stage} stage.`, permittedStages});
    }

    const trace = await prisma.$transaction(async tx => {
      const product = await tx.product.findUnique({where: {id: productId}, select: {id: true, productName: true, batchNumber: true, manufacturerId: true}});
      if (!product) { const error = new Error("Product not found"); error.status = 404; throw error; }
      const createdTrace = await tx.trace.create({
        data: {productId, stage, location, latitude, longitude, temperature, remarks, eventDate: new Date(), updatedById: req.user.id},
      });
      await tx.product.update({where: {id: productId}, data: {status: stage}});
      await tx.notification.create({data: {
        type: "JOURNEY_UPDATED", severity: "INFO", title: "Batch journey updated",
        message: `${product.productName} reached ${stage.toLowerCase().replaceAll("_", " ")} at ${location}.`,
        metadata: {stage, location, updatedByRole: req.user.role, updatedById: req.user.id},
        userId: product.manufacturerId, productId: product.id,
      }});
      return createdTrace;
    });
    res.status(201).json({success: true, message: "Journey checkpoint recorded", trace});
  } catch (err) {
    console.error("Trace update error:", err);
    res.status(err.status || 500).json({success: false, message: err.message});
  }
};

const getTimeline = async (req, res) => {
  try {
    const timeline = await prisma.trace.findMany({
      where: {productId: req.params.id},
      include: {updatedBy: {select: {id: true, name: true, email: true, role: true}}},
      orderBy: [{eventDate: "asc"}, {createdAt: "asc"}],
    });
    res.json(timeline);
  } catch (err) { res.status(500).json({message: err.message}); }
};

module.exports = {addTrace, getTimeline, roleStages};
