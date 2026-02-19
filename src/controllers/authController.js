const User = require('../models/User');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const SALT_ROUNDS = 10;

/* ── helpers ─────────────────────────────────────── */

function signAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m',
    });
}

function signRefreshToken(payload) {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d',
    });
}

/* ── signup ──────────────────────────────────────── */

async function signup(req, res) {
    const { email, password, name } = req.body || {};
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(409).json({ message: 'Email already in use' });
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

    await User.create({
        email,
        passwordHash,
        name,
        emailVerificationToken,
        emailVerificationExpires,
    });

    return res.status(201).json({
        message: 'User created',
        token: emailVerificationToken,
    });
}

/* ── verify email ────────────────────────────────── */

async function verifyEmail(req, res) {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Token is required' });

    const user = await User.findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return res.json({ message: 'Email verified!' });
}

/* ── login ───────────────────────────────────────── */

async function login(req, res) {
    const { email, password } = req.body || {};
    if (!email || !password)
        return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.isVerified)
        return res.status(403).json({ message: 'Email not verified' });

    const accessToken = signAccessToken({ sub: user.id });
    const refreshToken = signRefreshToken({
        sub: user.id,
        tid: crypto.randomBytes(8).toString('hex'),
    });

    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push({ token: refreshToken, createdAt: new Date() });
    await user.save();

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({ accessToken });
}

/* ── refresh token ───────────────────────────────── */

async function refreshToken(req, res) {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token' });

    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
        return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: 'User not found' });

    const stored = (user.refreshTokens || []).find((t) => t.token === token);
    if (!stored) return res.status(401).json({ message: 'Token revoked' });

    // Rotate: remove old, issue new
    user.refreshTokens = user.refreshTokens.filter((t) => t.token !== token);
    const newRefresh = signRefreshToken({
        sub: user.id,
        tid: crypto.randomBytes(8).toString('hex'),
    });
    user.refreshTokens.push({ token: newRefresh, createdAt: new Date() });
    await user.save();

    res.cookie('refreshToken', newRefresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const accessToken = signAccessToken({ sub: user.id });
    return res.json({ accessToken });
}

/* ── logout ──────────────────────────────────────── */

async function logout(req, res) {
    const token = req.cookies.refreshToken;
    if (token) {
        const decoded = jwt.decode(token);
        if (decoded && decoded.sub) {
            const user = await User.findById(decoded.sub);
            if (user) {
                user.refreshTokens = (user.refreshTokens || []).filter(
                    (t) => t.token !== token,
                );
                await user.save();
            }
        }
    }
    res.clearCookie('refreshToken');
    return res.json({ message: 'Logged out' });
}

/* ── request password reset ──────────────────────── */

async function requestPasswordReset(req, res) {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    // Always return success to prevent user enumeration
    if (!user) return res.json({ message: 'If the email exists, a reset link has been sent' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // In production you'd send an email here via nodemailer
    // For development, return the token in the response
    return res.json({
        message: 'If the email exists, a reset link has been sent',
        resetToken, // remove in production
    });
}

/* ── reset password ──────────────────────────────── */

async function resetPassword(req, res) {
    const { token, newPassword } = req.body || {};
    if (!token || !newPassword)
        return res.status(400).json({ message: 'Token and new password are required' });

    const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = []; // invalidate all sessions
    await user.save();

    return res.json({ message: 'Password updated successfully' });
}

module.exports = {
    signup,
    verifyEmail,
    login,
    refreshToken,
    logout,
    requestPasswordReset,
    resetPassword,
};
