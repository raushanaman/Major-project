const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../../../models/User');
const Shop = require('../../../models/Shop');

const strongPwd = /^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const signup = async (req, res) => {
  const { firstName, lastName, email, password, role, shopName, phone, address, category } = req.body;
  if (!strongPwd.test(password))
    return res.status(400).json({ message: 'Password must be at least 8 characters and include a special character' });
  try {
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ firstName, lastName, email, password: hashed, role, shopName, phone, address, category });
    if (role === 'merchant' && shopName)
      await Shop.create({ owner: user._id, name: shopName, category: category?.toLowerCase() || 'groceries', phone, address });
    const token = signToken(user);
    res.status(201).json({ message: 'User created', token, userId: user._id, firstName: user.firstName, role: user.role });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    const token = signToken(user);
    res.json({ message: 'Login successful', token, userId: user._id, firstName: user.firstName, role: user.role });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

const getMe = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    res.json(user);
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const changePassword = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  const { currentPassword, newPassword } = req.body;
  if (!strongPwd.test(newPassword))
    return res.status(400).json({ message: 'Password must be at least 8 characters and include a special character' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(401).json({ message: 'Current password is incorrect' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with this email' });
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await transporter.sendMail({
      from: `"Mandi-360" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset your Mandi-360 password',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#f8fafc;border-radius:16px;">
          <h2 style="color:#1e293b;font-size:24px;font-weight:900;margin-bottom:8px;">Reset Your Password</h2>
          <p style="color:#64748b;margin-bottom:24px;">Click the button below to reset your password. This link expires in <strong>15 minutes</strong>.</p>
          <a href="${resetUrl}" style="display:inline-block;background:#ef4444;color:white;padding:14px 28px;border-radius:12px;font-weight:700;text-decoration:none;font-size:15px;">Reset Password</a>
          <p style="color:#94a3b8;font-size:12px;margin-top:24px;">If you didn't request this, ignore this email.</p>
        </div>
      `,
    });
    res.json({ message: 'Reset link sent to your email' });
  } catch {
    res.status(500).json({ message: 'Failed to send email. Try again.' });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!strongPwd.test(password))
    return res.status(400).json({ message: 'Password must be at least 8 characters and include a special character' });
  try {
    const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Reset link is invalid or expired' });
    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { signup, login, getMe, changePassword, forgotPassword, resetPassword };
