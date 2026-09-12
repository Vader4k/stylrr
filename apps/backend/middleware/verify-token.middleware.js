import jwt from 'jsonwebtoken'
import { User } from '../models/user.js'

const clearStaleToken = (req, res) => {
    const isSecure =
        process.env.NODE_ENV === "production" ||
        req.secure ||
        req.get("x-forwarded-proto") === "https";
    // Must mirror the options used when the cookie was set in loginUser,
    // otherwise the browser keeps the stale cookie and every request 401s.
    res.clearCookie("token", {
        httpOnly: true,
        secure: isSecure,
        sameSite: "lax",
        path: "/",
    });
};

export const protect = async (req, res, next) => {
    let token = req.cookies.token

    if(!token){
        return res.status(401).json({message: "Unauthorized"})
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = await User.findById(decoded.id).select("-password")

        if(!req.user){
            clearStaleToken(req, res);
            return res.status(401).json({message: "User not found"})
        }

        if(req.user.isActive === false){
            clearStaleToken(req, res);
            return res.status(401).json({message: "User is not active"})
        }

        next()
    } catch (error) {
        clearStaleToken(req, res);
        return res.status(401).json({message: "Token invalid or expired"})
    }
}