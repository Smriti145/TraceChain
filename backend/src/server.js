
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const traceRoutes = require("./routes/trace.routes");


const app = express();


app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));
app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
});


app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/traces", traceRoutes);

app.get("/api/health", (req, res) => {

    res.json({

        success:true,

        message:"Fandoro API Running"

    });

});

app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
        success: false,
        message: err.status ? err.message : "Internal server error",
    });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT,()=>{

console.log(`Server running on ${PORT}`);

});
