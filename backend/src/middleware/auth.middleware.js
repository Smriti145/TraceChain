const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {

    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {

        return res.status(401).json({

            message: "Bearer token required"

        });

    }

    const token = auth.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Bearer token required" });
    }

    try {

        const decoded = jwt.verify(

            token,

            process.env.JWT_SECRET

        );

        req.user = decoded;

        next();

    }

    catch {

        return res.status(401).json({

            message: "Invalid Token"

        });

    }

};

module.exports = protect;
