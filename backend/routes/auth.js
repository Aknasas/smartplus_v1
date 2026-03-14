// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');
const emailService = require('../services/emailService'); // Add this line

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Register new user
router.post('/register', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Log the entire request body for debugging
    console.log('========== REGISTRATION REQUEST ==========');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('==========================================');

    // Destructure with all possible fields
    const {
      username,
      password,
      email,
      full_name,
      first_name,
      last_name,
      date_of_birth,
      role = 'patient'
    } = req.body;

    // Log extracted values
    console.log('Extracted values:');
    console.log('- username:', username ? '✓' : '✗');
    console.log('- password:', password ? '✓' : '✗');
    console.log('- email:', email ? '✓' : '✗');
    console.log('- full_name:', full_name || 'not provided');
    console.log('- first_name:', first_name || 'not provided');
    console.log('- last_name:', last_name || 'not provided');
    console.log('- role:', role);

    // Determine first_name and last_name
    let firstName = '';
    let lastName = '';

    // Case 1: first_name and last_name are provided directly
    if (first_name && first_name.trim()) {
      firstName = first_name.trim();
      lastName = (last_name && last_name.trim()) || '';
      console.log('✅ Using provided first_name/last_name');
    }
    // Case 2: full_name is provided
    else if (full_name && full_name.trim()) {
      const nameParts = full_name.trim().split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
      console.log('✅ Using full_name, split into:', { firstName, lastName });
    }
    // Case 3: Neither provided - error
    else {
      console.log('❌ No name fields provided');
      return res.status(400).json({
        error: 'Name is required. Please provide first_name/last_name or full_name.'
      });
    }

    // Validation - check for required fields
    const missingFields = [];
    if (!username || !username.trim()) missingFields.push('username');
    if (!password) missingFields.push('password');
    if (!email || !email.trim()) missingFields.push('email');
    if (!firstName) missingFields.push('first name');

    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields);
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Check if user exists
    const existingUser = await client.query(
      'SELECT user_id FROM users WHERE username = $1 OR email = $2',
      [username.trim(), email.trim()]
    );

    if (existingUser.rows.length > 0) {
      console.log('❌ User already exists:', username);
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into users table
    const userResult = await client.query(
      `INSERT INTO users (username, password, email, role, first_name, last_name, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING user_id, username, email, role, first_name, last_name, created_at`,
      [username.trim(), hashedPassword, email.trim(), role, firstName, lastName]
    );

    const newUser = userResult.rows[0];
    console.log('✅ User created in database:');
    console.log('   - ID:', newUser.user_id);
    console.log('   - Username:', newUser.username);
    console.log('   - Name:', firstName, lastName);

    // Create role-specific record
    if (role === 'patient') {
      await client.query(
        `INSERT INTO patients (patient_id, date_of_birth, registration_completed, registration_date)
         VALUES ($1, $2, true, CURRENT_TIMESTAMP)`,
        [newUser.user_id, date_of_birth || null]
      );
      console.log('✅ Patient record created');
    } else if (role === 'doctor') {
      await client.query(
        `INSERT INTO doctors (doctor_id, specialization, license_number)
         VALUES ($1, 'General Practitioner', 'TEMP-' || $1)`,
        [newUser.user_id]
      );
      console.log('✅ Doctor record created');
    } else if (role === 'ambulance') {
      await client.query(
        `INSERT INTO ambulance_services (service_id, service_name, license_number)
         VALUES ($1, $2, 'AMB-' || $1)`,
        [newUser.user_id, firstName + ' ' + lastName]
      );
      console.log('✅ Ambulance service record created');
    }

    await client.query('COMMIT');

    // Generate JWT
    const token = jwt.sign(
      {
        user_id: newUser.user_id,
        username: newUser.username,
        role: newUser.role,
        name: (newUser.first_name + ' ' + newUser.last_name).trim()
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send welcome email to new user
    try {
      const userName = newUser.first_name || newUser.username;
      await emailService.sendWelcomeEmail(newUser.email, userName);
      console.log('✅ Welcome email sent to:', newUser.email);
    } catch (emailError) {
      // Don't fail registration if email fails
      console.error('❌ Failed to send welcome email:', emailError.message);
    }

    console.log('✅ Registration successful!');
    console.log('==========================================');

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        user_id: newUser.user_id,
        username: newUser.username,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        full_name: (newUser.first_name + ' ' + newUser.last_name).trim(),
        role: newUser.role
      }
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Registration error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query(
      `SELECT
        u.user_id, u.username, u.password, u.email, u.role, u.first_name, u.last_name,
        p.patient_id, p.date_of_birth, p.blood_type, p.medical_conditions
       FROM users u
       LEFT JOIN patients p ON u.user_id = p.patient_id
       WHERE u.username = $1 AND u.is_active = true`,
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
      [user.user_id]
    );

    const token = jwt.sign(
      {
        user_id: user.user_id,
        username: user.username,
        role: user.role,
        name: (user.first_name + ' ' + user.last_name).trim()
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    delete user.password;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        full_name: (user.first_name + ' ' + user.last_name).trim(),
        role: user.role,
        patient_id: user.patient_id,
        blood_type: user.blood_type
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Forgot password - request reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    console.log('📧 Forgot password request for email:', email);

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const userResult = await pool.query(
      'SELECT user_id, username, email, first_name FROM users WHERE email = $1 AND is_active = true',
      [email]
    );

    if (userResult.rows.length === 0) {
      // For security, don't reveal if email exists or not
      console.log('No user found with email:', email);
      return res.json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link.'
      });
    }

    const user = userResult.rows[0];
    console.log('✅ User found:', user.user_id);

    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { user_id: user.user_id, email: user.email, purpose: 'password-reset' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Store reset token in database
    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = NOW() + INTERVAL \'1 hour\' WHERE user_id = $2',
      [resetToken, user.user_id]
    );

    // Send password reset email using email service
    const userName = user.first_name || user.username;
    await emailService.sendPasswordResetEmail(user.email, userName, resetToken);

    res.json({
      success: true,
      message: 'If your email is registered, you will receive a password reset link.'
    });

  } catch (err) {
    console.error('❌ Forgot password error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Check if token is for password reset
    if (decoded.purpose !== 'password-reset') {
      return res.status(400).json({ error: 'Invalid token purpose' });
    }

    // Check if token exists in database
    const userResult = await pool.query(
      'SELECT user_id, email, first_name, username FROM users WHERE user_id = $1 AND reset_token = $2 AND reset_token_expiry > NOW()',
      [decoded.user_id, token]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const user = userResult.rows[0];

    // Validate password strength
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters and contain at least one letter and one number'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await pool.query(
      'UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE user_id = $2',
      [hashedPassword, decoded.user_id]
    );

    console.log('✅ Password reset successful for user:', decoded.user_id);

    // Optional: Send confirmation email
    try {
      const userName = user.first_name || user.username;
      // You can create a password changed confirmation email template
      console.log(`Password changed for ${user.email}`);
    } catch (emailError) {
      console.error('Failed to send password change confirmation:', emailError.message);
    }

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.'
    });

  } catch (err) {
    console.error('❌ Reset password error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Verify token
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    valid: true,
    user: req.user
  });
});

module.exports = router;