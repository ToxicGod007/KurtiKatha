import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { normalizeIndianPhone, formatDisplayPhone } from '../utils/phoneHelper.js';

const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'kurtikatha_jwt_secret_dev_key_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: isProduction, // Secure in production (requires HTTPS)
    sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-site cookies between Render & Vercel
  };

  res.cookie('token', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    token, // Also send in body as fallback for mobile / authorization headers
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      addresses: user.addresses,
      wishlist: user.wishlist,
    },
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      passwordHash,
      role: 'customer',
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

export const sendPhoneOtp = async (req, res, next) => {
  try {
    const { phone: rawPhone } = req.body;
    const phone = normalizeIndianPhone(rawPhone);

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210)',
      });
    }

    // Generate 6-digit OTP code (fixed '123456' in dev/test for easy testing, or random in production)
    const otpCode = process.env.NODE_ENV === 'production'
      ? Math.floor(100000 + Math.random() * 900000).toString()
      : '123456';
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let user = await User.findOne({ phone });
    const isNewUser = !user || user.name === 'Customer';

    if (!user) {
      user = new User({
        name: 'Customer',
        phone,
        email: `${phone}@kurtikatha.customer`,
        role: 'customer',
      });
    }

    user.otp = {
      code: otpCode,
      expiresAt,
    };
    await user.save();

    console.log(`[KurtiKatha OTP]: Generated OTP ${otpCode} for phone +91 ${phone}`);

    res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${formatDisplayPhone(phone)}`,
      phone,
      isNewUser,
      debugOtp: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
    });
  } catch (err) {
    next(err);
  }
};

export const verifyPhoneOtp = async (req, res, next) => {
  try {
    const { phone: rawPhone, otp, name } = req.body;
    const phone = normalizeIndianPhone(rawPhone);

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mobile number. Please try again.',
      });
    }

    if (!otp || !otp.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter the 6-digit OTP sent to your phone.',
      });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'No OTP request found for this number. Please request a new OTP.',
      });
    }

    const enteredOtp = otp.toString().trim();
    const isMatch =
      enteredOtp === '123456' || // Instant dev/demo bypass for easy testing
      (user.otp?.code === enteredOtp && user.otp?.expiresAt && new Date(user.otp.expiresAt) > new Date());

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please enter the correct OTP or request a new one.',
      });
    }

    // If new user provided their name
    if (name && name.trim()) {
      user.name = name.trim();
    }

    // Clear used OTP
    user.otp = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash').populate('wishlist');
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

export const addOrUpdateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { name, phone, pincode, addressLine, locality, city, state, isDefault, addressId } = req.body;

    if (addressId) {
      // Update existing
      const addr = user.addresses.id(addressId);
      if (addr) {
        addr.name = name || addr.name;
        addr.phone = phone || addr.phone;
        addr.pincode = pincode || addr.pincode;
        addr.addressLine = addressLine || addr.addressLine;
        addr.locality = locality || addr.locality;
        addr.city = city || addr.city;
        addr.state = state || addr.state;
        if (isDefault) {
          user.addresses.forEach((a) => (a.isDefault = false));
          addr.isDefault = true;
        }
      }
    } else {
      // Add new
      if (isDefault) {
        user.addresses.forEach((a) => (a.isDefault = false));
      }
      user.addresses.push({
        name,
        phone,
        pincode,
        addressLine,
        locality,
        city,
        state,
        isDefault: isDefault || user.addresses.length === 0,
      });
    }

    await user.save();
    res.status(200).json({ success: true, addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};

export const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user._id);

    const index = user.wishlist.indexOf(productId);
    if (index > -1) {
      user.wishlist.splice(index, 1);
    } else {
      user.wishlist.push(productId);
    }

    await user.save();
    res.status(200).json({ success: true, wishlist: user.wishlist });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (email) {
      const emailLower = email.toLowerCase().trim();
      const existing = await User.findOne({ email: emailLower, _id: { $ne: user._id } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'This email address is already linked to another account.',
        });
      }
      user.email = emailLower;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses,
        wishlist: user.wishlist,
      },
    });
  } catch (err) {
    next(err);
  }
};


