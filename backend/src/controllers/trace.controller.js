const prisma = require("../config/prisma");

// Add Trace Event
const addTrace = async (req, res) => {
  try {

    const {
      productId,
      // stage,
      location,
      latitude,
      longitude,
      remarks
    } = req.body;

    let stage = "";

switch(req.user.role){

    case "MANUFACTURER":
        stage="MANUFACTURED";
        break;

    case "WAREHOUSE":
        stage="WAREHOUSE";
        break;

    case "DISTRIBUTOR":
        stage="DISTRIBUTED";
        break;

    case "RETAILER":
        stage="RETAIL";
        break;

    default:

        return res.status(403).json({

            message:"Customers cannot update products."

        });

}

    const trace = await prisma.$transaction(async tx => {
      const product = await tx.product.findUnique({
        where: {id: productId},
        select: {id: true, productName: true, batchNumber: true, manufacturerId: true},
      });

      if (!product) {
        const error = new Error("Product not found");
        error.status = 404;
        throw error;
      }

      const createdTrace = await tx.trace.create({
        data: {
          productId,
          stage,
          location,
          latitude,
          longitude,
          remarks,
          eventDate: new Date(),
          updatedById: req.user.id
        }
      });

      await tx.product.update({where: {id: productId}, data: {status: stage}});
      await tx.notification.create({
        data: {
          type: "JOURNEY_UPDATED",
          severity: "INFO",
          title: "Batch journey updated",
          message: `${product.productName} reached ${stage.toLowerCase().replaceAll("_", " ")} at ${location}.`,
          metadata: {stage, location, updatedByRole: req.user.role},
          userId: product.manufacturerId,
          productId: product.id,
        },
      });

      return createdTrace;
    });

    res.status(201).json({
      success: true,
      message: "Trace Added",
      trace
    });

  } catch (err) {

    console.log(err);

    res.status(err.status || 500).json({
      success: false,
      message: err.message
    });

  }
};

// Timeline

const getTimeline = async (req, res) => {

  try {

    const timeline = await prisma.trace.findMany({

      where: {
        productId: req.params.id
      },

      include: {
        updatedBy: {
          select: { id: true, name: true, email: true, role: true }
        }
      },

      orderBy: {
        createdAt: "asc"
      }

    });

    res.json(timeline);

  } catch (err) {

    res.status(500).json({

      message: err.message

    });

  }

};

module.exports = {

  addTrace,

  getTimeline

};
