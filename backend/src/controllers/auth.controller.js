const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/jwt");

const publicUser = ({ password, ...user }) => user;

const register = async (req, res) => {

    try {

        const { name, email, password, accountType } = req.body;

        const exists = await prisma.user.findUnique({
            where: { email }
        });

        if (exists) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({

            data: {

                name,

                email,

                password: hashedPassword,

                role: accountType === "BUSINESS" ? "MANUFACTURER" : "CUSTOMER",

            }

        });

        const token = generateToken(user);

        res.status(201).json({

            message: "User Registered",

            token,

            user: publicUser(user)

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            message: "Server Error"

        });

    }

};

const login = async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await prisma.user.findUnique({

            where: { email }

        });

        // Run a hash comparison even for unknown accounts so response timing and
        // messages do not disclose whether an email address is registered.
        const fallbackHash = "$2b$10$CwTycUXWue0Thq9StjUM0uJ8YgFfBvMFeV5a9x9pQ5N2lE5j8K2Pi";
        const match = await bcrypt.compare(password, user?.password || fallbackHash);

        if (!user || !match) {

            return res.status(401).json({

                message: "Invalid email or password"

            });

        }

        const token = generateToken(user);

        res.json({

            message: "Login Successful",

            token,

            user: publicUser(user)

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            message: err.message

        });

    }

};

const me = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({where: {id: req.user.id}});
        if (!user) return res.status(404).json({message: "Account not found"});
        res.json({user: publicUser(user)});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Unable to load account"});
    }
};

module.exports = {

    register,

    login,

    me,

};
