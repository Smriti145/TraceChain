const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/jwt");

const publicUser = ({ password, ...user }) => user;

const register = async (req, res) => {

    try {

        const { name, email, password, role } = req.body;

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

                role,

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

        if (!user) {

            return res.status(404).json({

                message: "User not found"

            });

        }

        const match = await bcrypt.compare(

            password,

            user.password

        );

        if (!match) {

            return res.status(401).json({

                message: "Invalid Password"

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

module.exports = {

    register,

    login,

};
