import jwt from 'jsonwebtoken';
import dotend from 'dotenv';
dotend.config();
const JWT_SECRET = process.env.JWT_SECRET;
export const generateToken = (user) => {
    return jwt.sign({ user }, JWT_SECRET, { expiresIn: "1d" });
};
//# sourceMappingURL=GenerateToken.js.map