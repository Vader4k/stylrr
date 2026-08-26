import { User } from "../models/user.js";
import { hashPassword, comparePassword } from "../utils/utils.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/mail.js";
import { welcomeEmail } from "../emails/welcome.js";
import { Cart } from "../models/cart.model.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "please provide all fields" });
    }

    //check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "user already exits" });
    }

    //password validation
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "password must be at least 6 characters long" });
    }

    //email validation
    if (!email.includes("@")) {
      return res.status(400).json({ message: "invalid email" });
    }

    //hash password
    const hashedPassword = await hashPassword(password);

    //create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    //save user
    await user.save();

    sendEmail({
      to: user.email,
      subject: "Welcome to Stylr!",
      html: welcomeEmail(user.name),
    })

    res.status(201).json({ message: "user registered successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "please provide email and password" });
    }

    //check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    if (user.isActive === false) {
      return res
        .status(403)
        .json({ message: "account is currently suspended" });
    }

    //check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    // merge guest cart if it exists
    if (req.cookies.cartId) {
      const guestCartId = req.cookies.cartId;
      const guestCart = await Cart.findOne({ cartId: guestCartId });

      if (guestCart) {
        const userCart = await Cart.findOne({ user: user._id });

        if (userCart) {
          // Merge guest cart items into user cart
          guestCart.items.forEach(guestItem => {
            const existingItem = userCart.items.find(item =>
              item.sku === guestItem.sku &&
              item.product.toString() === guestItem.product.toString() &&
              item.size === guestItem.size &&
              (item.color || null) === (guestItem.color || null)
            );

            if (existingItem) {
              existingItem.quantity += guestItem.quantity;
            } else {
              userCart.items.push(guestItem);
            }
          });
          await userCart.save();
          await Cart.deleteOne({ _id: guestCart._id });
        } else {
          // Convert guest cart to user cart
          guestCart.user = user._id;
          guestCart.cartId = null; // Important: remove cartId so it doesn't violate unique index on guest carts
          await guestCart.save();
        }
        res.clearCookie("cartId");
      }
    }

    //generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    //set http only cookie
    const isSecure =
      process.env.NODE_ENV === "production" ||
      req.secure ||
      req.get("x-forwarded-proto") === "https";

    //set http only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(200).json({
      message: "user logged in successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "user logged out successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const getMe = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "unauthorized" });
  }
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    res.status(200).json({
      message: "user fetched successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};
