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

    const trace = await prisma.trace.create({
      data: {
        productId,
        stage,
        location,
        latitude,
        longitude,
        remarks,
        updatedById: req.user.id
      }
    });

    // Update Product Status
    await prisma.product.update({
      where: {
        id: productId
      },
      data: {
        status: stage
      }
    });

    res.status(201).json({
      success: true,
      message: "Trace Added",
      trace
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
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
