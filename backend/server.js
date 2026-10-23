const express = require('express');
const cors = require('cors');
const { connectDB, sequelize } = require('./config/db');

// Import Models so Sequelize creates the tables
const User = require('./models/User');
const Exam = require('./models/Exam');
const Warning = require('./models/Warning');
const Question = require('./models/Question');
const Payment = require('./models/Payment');
const ArenaQuestion = require('./models/ArenaQuestion');
const Homework = require('./models/Homework');
const ProjectFile = require('./models/ProjectFile');
const CourseTopic = require('./models/CourseTopic');
const DailyQuote = require('./models/DailyQuote');

// Define associations
User.hasMany(Payment, { foreignKey: 'userId' });
Payment.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Homework, { foreignKey: 'creatorId' });
Homework.belongsTo(User, { foreignKey: 'creatorId' });

User.hasMany(ProjectFile, { foreignKey: 'studentId' });
ProjectFile.belongsTo(User, { foreignKey: 'studentId' });

Homework.hasMany(ProjectFile, { foreignKey: 'homeworkId' });
ProjectFile.belongsTo(Homework, { foreignKey: 'homeworkId' });

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Promise Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('⚠️ Uncaught Exception:', err);
});

const app = express();
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyUtrInEmails } = require('./utils/emailVerification');
const { verifyToken, requireRole } = require('./middleware/auth');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID');
const { evaluateCode } = require('./utils/aiEvaluator');

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/videos/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
});
const upload = multer({ storage: storage });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root Health / Info endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: '🚀 QodeQuant Backend API is running successfully!',
    version: '2.4.0',
    database: 'MySQL Connected',
    frontend: 'http://localhost:5173'
  });
});

// Connect to Database
connectDB();

// Sync Models (Creates tables if they don't exist)
sequelize.sync().then(async () => {
  console.log("✅ Database Synced");
  
  // Seed Default System Accounts (SuperAdmin, Admin, Teacher)
  try {
    // 1. Master Super Admin (superadmin@qodequant.com)
    let masterSuperAdmin = await User.findOne({ where: { email: 'superadmin@qodequant.com' } });
    if (!masterSuperAdmin) {
      masterSuperAdmin = await User.create({
        name: 'Master Super Admin',
        email: 'superadmin@qodequant.com',
        password: 'SuperAdmin@2026',
        role: 'superadmin',
        isPro: true
      });
      console.log("👑 Super Admin seeded: superadmin@qodequant.com (Pass: SuperAdmin@2026)");
    } else if (masterSuperAdmin.role !== 'superadmin') {
      masterSuperAdmin.role = 'superadmin';
      await masterSuperAdmin.save();
    }

    // 2. Personal Super Admin (swatikumarisuman2@gmail.com)
    let personalSuperAdmin = await User.findOne({ where: { email: 'swatikumarisuman2@gmail.com' } });
    if (!personalSuperAdmin) {
      personalSuperAdmin = await User.create({
        name: 'Swati Kumari Suman',
        email: 'swatikumarisuman2@gmail.com',
        password: 'Admin@123',
        role: 'superadmin',
        isPro: true
      });
      console.log("👑 Personal Super Admin seeded: swatikumarisuman2@gmail.com (Pass: Admin@123)");
    } else if (personalSuperAdmin.role !== 'superadmin') {
      personalSuperAdmin.role = 'superadmin';
      await personalSuperAdmin.save();
    }

    // 3. Platform Content Admin (admin@qodequant.com)
    let platformAdmin = await User.findOne({ where: { email: 'admin@qodequant.com' } });
    if (!platformAdmin) {
      platformAdmin = await User.create({
        name: 'Platform Content Admin',
        email: 'admin@qodequant.com',
        password: 'Admin@2026',
        role: 'admin',
        isPro: true
      });
      console.log("🛡️ Admin seeded: admin@qodequant.com (Pass: Admin@2026)");
    } else if (platformAdmin.role !== 'admin' && platformAdmin.role !== 'superadmin') {
      platformAdmin.role = 'admin';
      await platformAdmin.save();
    }

    // 4. Default Teacher (teacher@qodequant.com)
    let defaultTeacher = await User.findOne({ where: { email: 'teacher@qodequant.com' } });
    if (!defaultTeacher) {
      defaultTeacher = await User.create({
        name: 'Prof. Aloknath',
        email: 'teacher@qodequant.com',
        password: 'password123',
        role: 'teacher',
        isPro: true
      });
      console.log("🎓 Default Teacher seeded: teacher@qodequant.com");
    }
  } catch (err) {
    console.error("Error seeding system accounts:", err);
  }

  // Seed default daily quotes if none exist
  try {
    const quoteCount = await DailyQuote.count();
    if (quoteCount === 0) {
      await DailyQuote.bulkCreate([
        {
          text: "Why do programmers prefer dark mode? Because light attracts bugs. 🐛",
          author: "Anonymous Coder",
          category: "funny",
          isActive: true
        },
        {
          text: "There are 10 types of people in the world: those who understand binary, and those who don't. ⚡",
          author: "Binary Dev",
          category: "funny",
          isActive: false
        },
        {
          text: "It works on my machine... so we're packaging your machine to production! 🚀",
          author: "DevOps Logic",
          category: "funny",
          isActive: false
        },
        {
          text: "Code is like humor. When you have to explain it, it’s bad. 😄",
          author: "Cory House",
          category: "wisdom",
          isActive: false
        },
        {
          text: "First, solve the problem. Then, write the code. 💻",
          author: "John Johnson",
          category: "quote",
          isActive: false
        },
        {
          text: "Debugging: Being the detective in a crime movie where you are also the murderer. 🕵️‍♂️",
          author: "Senior Dev",
          category: "funny",
          isActive: false
        }
      ]);
      console.log("✅ Default Daily Quotes seeded successfully");
    }
  } catch (err) {
    console.error("Error seeding quotes:", err);
  }
}).catch((err) => {
  console.error("❌ Database sync error:", err);
});

const checkAndExpirePro = async (user) => {
  if (user && user.isPro && user.proExpiryDate && new Date(user.proExpiryDate) < new Date()) {
    user.isPro = false;
    user.proExpiryDate = null;
    await user.save();
  }
  return user;
};

// --- API ROUTES ---

// 1. Create a New Exam
app.post('/api/exams', verifyToken, async (req, res) => {
  try {
    const { title, description, durationMinutes, questions, status, scheduledFor } = req.body;
    
    const newExam = await Exam.create({
      title,
      description,
      startTime: status === 'live' ? new Date() : (scheduledFor || new Date()),
      durationMinutes: durationMinutes || 60,
      status: status || 'draft',
      scheduledFor: scheduledFor || null,
      creatorId: req.userId 
    });

    if (questions && questions.length > 0) {
      const questionsData = questions.map(q => ({
        title: q.title,
        content: q.content,
        examId: newExam.id
      }));
      await Question.bulkCreate(questionsData);
    }

    let shareableLink = null;
    if (newExam.status === 'live' || newExam.status === 'scheduled') {
      shareableLink = `http://localhost:5173/exam/${newExam.id}`;
    }

    res.status(201).json({
      message: 'Exam created successfully!',
      examId: newExam.id,
      status: newExam.status,
      link: shareableLink
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create exam' });
  }
});

// Fetch all exams for a teacher dashboard
app.get('/api/exams', verifyToken, async (req, res) => {
  try {
    const exams = await Exam.findAll({
      where: { creatorId: req.userId },
      order: [['createdAt', 'DESC']]
    });
    res.json(exams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
});

// Make an exam live manually
app.put('/api/exams/:id/live', async (req, res) => {
  try {
    const examId = req.params.id;
    const exam = await Exam.findByPk(examId);

    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    exam.status = 'live';
    exam.startTime = new Date();
    await exam.save();

    const shareableLink = `http://localhost:5173/exam/${exam.id}`;
    res.json({ message: 'Exam is now live!', link: shareableLink });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to make exam live' });
  }
});

// 2. Fetch Exam Details (For Student Dashboard)
app.get('/api/exams/:id', async (req, res) => {
  try {
    const examId = req.params.id;
    const exam = await Exam.findByPk(examId, {
      include: [{ model: Question, as: 'questions' }]
    });

    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    res.json(exam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch exam' });
  }
});

// 3. Course Topics Routes
app.get('/api/courses/:courseId/topics', async (req, res) => {
  try {
    const topics = await CourseTopic.findAll({
      where: { courseId: req.params.courseId },
      order: [['createdAt', 'ASC']]
    });
    res.json(topics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch course topics' });
  }
});

app.post('/api/courses/topics', upload.single('videoFile'), async (req, res) => {
  try {
    const { courseId, title, duration, summary, locked } = req.body;
    let videoUrl = '';
    
    if (req.file) {
      // Create absolute URL for video
      videoUrl = `http://localhost:5000/uploads/videos/${req.file.filename}`;
    }

    const newTopic = await CourseTopic.create({
      courseId,
      title,
      duration,
      summary,
      videoUrl,
      locked: locked === 'true'
    });
    
    res.status(201).json(newTopic);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create course topic' });
  }
});

// --- AUTH ROUTES ---
app.post('/api/auth/google', async (req, res) => {
  try {
    const { token, role } = req.body;
    
    let payload;
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID' && token && token !== 'mock_token') {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } else {
      console.log("[DEV] Mocking Google Login because GOOGLE_CLIENT_ID is not set or mock_token passed");
      payload = {
        email: 'test_google@qodequant.com',
        name: 'Test Google User',
        picture: 'https://via.placeholder.com/150',
        sub: 'mock_google_id_12345'
      };
    }
    
    const { email, name, picture, sub: googleId } = payload;
    
    let user = await User.findOne({ where: { email } });
    
    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        role: role || 'student',
        profilePic: picture,
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      if (!user.profilePic) user.profilePic = picture;
      await user.save();
    }
    
    await checkAndExpirePro(user);
    
    const jwtToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '7d' });
    
    res.json({ 
      message: 'Logged in with Google', 
      token: jwtToken, 
      user: { id: user.id, name: user.name, email: user.email, role: user.role, isPro: user.isPro, profilePic: user.profilePic } 
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ error: 'Google Login failed' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, role, password } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email already in use' });

    const newUser = await User.create({ name, email, phone, role, password });
    
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '7d' });
    res.status(201).json({ message: 'User registered successfully', token, user: { id: newUser.id, name, email, role, isPro: newUser.isPro } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.findOne({ where: { phone: email } });
    }
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
    
    await checkAndExpirePro(user);
    
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '7d' });
    res.json({ message: 'Logged in successfully', token, user: { id: user.id, name: user.name, email: user.email, role: user.role, isPro: user.isPro } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// --- USER PROFILE ROUTES ---
app.get('/api/user/profile', verifyToken, async (req, res) => {
  try {
    let user = await User.findByPk(req.userId, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    user = await checkAndExpirePro(user);
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.put('/api/user/profile', verifyToken, async (req, res) => {
  try {
    const { name, phone, collegeName, city, profilePic } = req.body;
    const user = await User.findByPk(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (collegeName !== undefined) user.collegeName = collegeName;
    if (city !== undefined) user.city = city;
    if (profilePic !== undefined) user.profilePic = profilePic;

    await user.save();
    res.json({ message: 'Profile updated successfully!', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

app.get('/api/admin/users', verifyToken, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [{ model: Payment, required: false }],
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/admin/stats', verifyToken, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalExams = await Exam.count();
    const activeTeachers = await User.count({ where: { role: 'teacher' } });
    
    const payments = await Payment.findAll({ where: { status: 'success' } });
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

    res.json({ totalUsers, totalExams, activeTeachers, totalRevenue });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// SuperAdmin: Update User Role (Promote/Demote)
app.put('/api/admin/users/:id/role', verifyToken, requireRole('superadmin'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'teacher', 'admin', 'superadmin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified.' });
    }
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.role = role;
    await user.save();
    res.json({ message: `Role updated to ${role} successfully!`, user: { id: user.id, name: user.name, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// SuperAdmin: Create Admin Account
app.post('/api/admin/create-admin', verifyToken, requireRole('superadmin'), async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User with this email already exists' });
    
    const assignedRole = role === 'superadmin' ? 'superadmin' : 'admin';
    const newAdmin = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      phone: phone || null,
      isPro: true
    });
    
    res.status(201).json({ message: `${assignedRole.toUpperCase()} account created successfully!`, user: { id: newAdmin.id, name: newAdmin.name, email: newAdmin.email, role: newAdmin.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create admin' });
  }
});

app.delete('/api/admin/users/:id', verifyToken, requireRole('superadmin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Prevent deleting the main admin dummy user for demo purposes if needed
    // if (user.id === 1) return res.status(400).json({ error: 'Cannot delete the main admin account' });

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// SuperAdmin: Create a Teacher Profile
app.post('/api/admin/teachers', verifyToken, requireRole('superadmin'), async (req, res) => {
  try {
    const { name, email, password, phone, collegeName, degree } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User with this email already exists' });
    
    const newTeacher = await User.create({
      name,
      email,
      password,
      role: 'teacher',
      phone: phone || null,
      collegeName: collegeName || null,
      degree: degree || null,
      isPro: true, // Optionally give teachers pro access by default
    });
    
    res.status(201).json({ message: 'Teacher profile created successfully!', user: { id: newTeacher.id, name: newTeacher.name, email: newTeacher.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create teacher profile' });
  }
});

// --- Daily Quotes & Funny Lines API ---
// Public: Get currently active quote (or all active quotes) for Landing Page
app.get('/api/quotes/active', async (req, res) => {
  try {
    const activeQuotes = await DailyQuote.findAll({ 
      where: { isActive: true }, 
      order: [['updatedAt', 'DESC']] 
    });

    if (activeQuotes && activeQuotes.length > 0) {
      return res.json({ 
        success: true, 
        quote: activeQuotes[0], 
        quotes: activeQuotes 
      });
    }

    // Fallback if none is marked active
    const latestQuote = await DailyQuote.findOne({ order: [['createdAt', 'DESC']] });
    if (latestQuote) {
      return res.json({ 
        success: true, 
        quote: latestQuote, 
        quotes: [latestQuote] 
      });
    }

    // Default static fallback
    res.json({
      success: true,
      quote: {
        id: 0,
        text: "Why do programmers prefer dark mode? Because light attracts bugs. 🐛",
        author: "Anonymous Coder",
        category: "funny"
      },
      quotes: []
    });
  } catch (error) {
    console.error("Error fetching active quote:", error);
    res.json({
      success: true,
      quote: {
        id: 0,
        text: "Why do programmers prefer dark mode? Because light attracts bugs. 🐛",
        author: "Anonymous Coder",
        category: "funny"
      },
      quotes: []
    });
  }
});

// Admin: Get all quotes
app.get('/api/admin/quotes', verifyToken, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const quotes = await DailyQuote.findAll({ order: [['createdAt', 'DESC']] });
    res.json(quotes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

// Admin: Create new quote/line
app.post('/api/admin/quotes', verifyToken, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const { text, author, category, makeActive } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Quote text is required' });
    }

    // If making this one active, deactivate others
    if (makeActive) {
      await DailyQuote.update({ isActive: false }, { where: {} });
    }

    const newQuote = await DailyQuote.create({
      text: text.trim(),
      author: author && author.trim() ? author.trim() : 'Admin Coder',
      category: category || 'funny',
      isActive: makeActive !== false // default true
    });

    res.status(201).json({ success: true, quote: newQuote });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create quote' });
  }
});

// Admin: Update quote
app.put('/api/admin/quotes/:id', verifyToken, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const { text, author, category, isActive } = req.body;
    const quote = await DailyQuote.findByPk(req.params.id);
    if (!quote) return res.status(404).json({ error: 'Quote not found' });

    if (isActive) {
      await DailyQuote.update({ isActive: false }, { where: {} });
    }

    await quote.update({
      text: text !== undefined ? text.trim() : quote.text,
      author: author !== undefined ? author.trim() : quote.author,
      category: category !== undefined ? category : quote.category,
      isActive: isActive !== undefined ? isActive : quote.isActive
    });

    res.json({ success: true, quote });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update quote' });
  }
});

// Admin: Set a specific quote as Active on Landing Page
app.put('/api/admin/quotes/:id/activate', verifyToken, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const quote = await DailyQuote.findByPk(req.params.id);
    if (!quote) return res.status(404).json({ error: 'Quote not found' });

    await DailyQuote.update({ isActive: false }, { where: {} });
    await quote.update({ isActive: true });

    res.json({ success: true, message: 'Quote set as active on landing page!', quote });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to activate quote' });
  }
});

// Admin: Delete a quote
app.delete('/api/admin/quotes/:id', verifyToken, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const quote = await DailyQuote.findByPk(req.params.id);
    if (!quote) return res.status(404).json({ error: 'Quote not found' });

    await quote.destroy();
    res.json({ success: true, message: 'Quote deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete quote' });
  }
});

// --- Payment API ---
app.post('/api/payment/upgrade', verifyToken, async (req, res) => {
  try {
    const { method, amount, utrNumber } = req.body;
    
    const user = await User.findByPk(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let paymentStatus = 'pending';
    let isPro = false;

    // Check if UTR is provided and verify it automatically via Gmail IMAP
    if (utrNumber && utrNumber.length === 12) {
      console.log(`[Auto-Verify] Checking Gmail for UTR: ${utrNumber}`);
      const isVerified = await verifyUtrInEmails(utrNumber);
      
      if (isVerified) {
        paymentStatus = 'success';
        isPro = true;
        // Upgrade the user immediately
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        await user.update({ isPro: true, proExpiryDate: expiryDate });
        console.log(`[Auto-Verify] User ${user.email} instantly upgraded to PRO!`);
      }
    }

    const payment = await Payment.create({
      userId: user.id,
      amount: amount || 5.00,
      method: method || 'upi',
      utrNumber: utrNumber || null,
      status: paymentStatus
    });

    if (isPro) {
      res.json({ message: 'Payment verified instantly! You are now a PRO user.', payment, isPro: true });
    } else {
      res.json({ message: 'Payment submitted for review!', payment, isPro: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Payment submission failed' });
  }
});

// Fetch Pending Payments for Admin
app.get('/api/admin/payments/pending', verifyToken, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const payments = await Payment.findAll({ 
      where: { status: 'pending' },
      include: [{ model: User, attributes: ['id', 'name', 'email', 'phone'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch pending payments' });
  }
});

// Admin Approve Payment & Send Notifications
app.post('/api/admin/payments/:id/approve', verifyToken, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    
    const user = await User.findByPk(payment.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Update DB
    payment.status = 'success';
    await payment.save();

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    user.isPro = true;
    user.proExpiryDate = expiryDate;
    await user.save();

    // 1. Send Email Notification (Simulated/Mock setup)
    /* 
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: 'YOUR_GMAIL@gmail.com', pass: 'YOUR_APP_PASSWORD' }
    });
    await transporter.sendMail({
      from: '"QodeQuant Admin" <admin@qodequant.com>',
      to: user.email,
      subject: "Welcome to PRO! 🌟",
      html: "<h3>Congratulations!</h3><p>Your payment has been verified. You are now a PRO member!</p>"
    });
    */
    console.log(`[EMAIL SENT] To: ${user.email} -> PRO Membership Activated!`);

    // 2. Send SMS Notification (Simulated)
    console.log(`[SMS SENT] To: ${user.phone} -> Your QodeQuant PRO account is now active!`);

    res.json({ message: 'Payment approved, User upgraded, Notifications sent!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to approve payment' });
  }
});

// --- Arena Question Routes ---

// Admin: Get all arena questions (optionally filter by track+level)
app.get('/api/admin/arena-questions', verifyToken, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const { track, level } = req.query;
    const where = {};
    if (track) where.track = track;
    if (level) where.level = parseInt(level);
    const questions = await ArenaQuestion.findAll({ where, order: [['track', 'ASC'], ['level', 'ASC'], ['orderIndex', 'ASC']] });
    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch arena questions' });
  }
});

// Admin: Add a new arena question
app.post('/api/admin/arena-questions', verifyToken, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const { track, level, title, content, difficulty, orderIndex, expectedOutput, professorName, institution } = req.body;
    if (!track || !level || !title || !content) {
      return res.status(400).json({ error: 'track, level, title, content are required' });
    }
    const q = await ArenaQuestion.create({ track, level: parseInt(level), title, content, difficulty: difficulty || 'easy', orderIndex: orderIndex || 0, expectedOutput: expectedOutput || null, professorName: professorName || null, institution: institution || null });
    res.status(201).json(q);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create arena question' });
  }
});

// Admin: Delete an arena question
app.delete('/api/admin/arena-questions/:id', verifyToken, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const q = await ArenaQuestion.findByPk(req.params.id);
    if (!q) return res.status(404).json({ error: 'Question not found' });
    await q.destroy();
    res.json({ message: 'Question deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// Admin: Update an arena question
app.put('/api/admin/arena-questions/:id', verifyToken, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const q = await ArenaQuestion.findByPk(req.params.id);
    if (!q) return res.status(404).json({ error: 'Question not found' });
    const { title, content, difficulty, orderIndex, expectedOutput, professorName, institution } = req.body;
    if (title !== undefined) q.title = title;
    if (content !== undefined) q.content = content;
    if (difficulty !== undefined) q.difficulty = difficulty;
    if (orderIndex !== undefined) q.orderIndex = orderIndex;
    if (expectedOutput !== undefined) q.expectedOutput = expectedOutput;
    if (professorName !== undefined) q.professorName = professorName;
    if (institution !== undefined) q.institution = institution;
    await q.save();
    res.json(q);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// Student: Fetch arena questions for a specific track + level
app.get('/api/arena/:track/:level', async (req, res) => {
  try {
    const { track, level } = req.params;
    const validTracks = ['beginner', 'intermediate', 'advanced'];
    if (!validTracks.includes(track)) return res.status(400).json({ error: 'Invalid track' });
    const lvl = parseInt(level);
    if (isNaN(lvl) || lvl < 1 || lvl > 10) return res.status(400).json({ error: 'Invalid level' });
    
    const questions = await ArenaQuestion.findAll({
      where: { track, level: lvl },
      order: [['orderIndex', 'ASC']]
    });
    
    const romanNumerals = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    const trackDisplay = track.charAt(0).toUpperCase() + track.slice(1);
    
    res.json({
      id: `arena_${track}_${level}`,
      title: `${trackDisplay} Track — Level ${romanNumerals[lvl]}`,
      description: `Arena challenge for ${trackDisplay} level ${romanNumerals[lvl]}`,
      track,
      level: lvl,
      questions: questions.map(q => ({ id: q.id, title: q.title, content: q.content, difficulty: q.difficulty, expectedOutput: q.expectedOutput || null, professorName: q.professorName || null, institution: q.institution || null }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch arena data' });
  }
});

// --- Code Execution API (Local Execution) ---
app.post('/api/execute', async (req, res) => {
  const { language, code, files, activeFile, customInput } = req.body;
  if (!code && (!files || files.length === 0)) return res.status(400).json({ error: 'No code provided' });

  const tempDir = path.join(__dirname, 'temp_execution');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  const timestamp = Date.now();
  const sessionDir = path.join(tempDir, `session_${timestamp}`);
  fs.mkdirSync(sessionDir);

  let inputRedirect = '';
  if (customInput !== undefined && customInput !== null && customInput.length > 0) {
    fs.writeFileSync(path.join(sessionDir, 'input.txt'), customInput);
    inputRedirect = ' < input.txt';
  }

  let runCommand;
  let mainFile = '';

  try {
    // Multi-file execution logic
    if (files && files.length > 0) {
      files.forEach(f => {
        const filePath = path.join(sessionDir, f.name);
        if (f.isFolder) {
          if (!fs.existsSync(filePath)) fs.mkdirSync(filePath, { recursive: true });
        } else {
          const dir = path.dirname(filePath);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(filePath, f.content || '');
        }
      });
      // Determine execution command
      if (language === 'python') {
        mainFile = files.find(f => f.name.endsWith('.py'))?.name || 'main.py';
        runCommand = `cd "${sessionDir}" && python "${mainFile}"${inputRedirect}`;
      } else if (language === 'cpp' || language === 'c') {
        // Compile all c/cpp files in the directory
        runCommand = `cd "${sessionDir}" && (g++ *.cpp *.c -o out.exe 2>/dev/null || g++ *.cpp -o out.exe 2>/dev/null || gcc *.c -o out.exe) && out.exe${inputRedirect}`;
      } else if (language === 'java') {
        let mainClassName = 'Main';
        let foundMain = false;
        if (activeFile) {
          const active = files.find(f => f.name === activeFile);
          if (active && active.name.endsWith('.java') && active.content && active.content.includes('void main(')) {
            mainClassName = active.name.replace('.java', '');
            foundMain = true;
          }
        }
        if (!foundMain) {
          for (const f of files) {
            if (f.name.endsWith('.java') && f.content && f.content.includes('void main(')) {
              mainClassName = f.name.replace('.java', '');
              break;
            }
          }
        }
        runCommand = `cd "${sessionDir}" && javac "${mainClassName}.java" && java ${mainClassName}${inputRedirect}`;
      }
    } 
    // Single-file fallback (for backward compatibility)
    else {
      if (language === 'python') {
        mainFile = 'main.py';
        fs.writeFileSync(path.join(sessionDir, mainFile), code);
        runCommand = `cd "${sessionDir}" && python "${mainFile}"${inputRedirect}`;
      } else if (language === 'cpp' || language === 'c') {
        mainFile = language === 'c' ? 'main.c' : 'main.cpp';
        fs.writeFileSync(path.join(sessionDir, mainFile), code);
        runCommand = `cd "${sessionDir}" && g++ "${mainFile}" -o out.exe && out.exe${inputRedirect}`;
      } else if (language === 'java') {
        const match = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
        mainFile = (match ? match[1] : 'Main') + '.java';
        fs.writeFileSync(path.join(sessionDir, mainFile), code);
        runCommand = `cd "${sessionDir}" && javac "${mainFile}" && java ${mainFile.replace('.java', '')}${inputRedirect}`;
      } else {
        return res.json({ output: 'Only Python, C, C++, and Java are supported for local execution right now.', isError: true });
      }
    }

    if (!runCommand) {
      return res.json({ output: 'Unsupported language configuration.', isError: true });
    }

    exec(runCommand, { timeout: 10000 }, (error, stdout, stderr) => {
      // Cleanup session dir
      if (fs.existsSync(sessionDir)) {
        try {
          fs.rmSync(sessionDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
        } catch (e) {
          console.error('Failed to cleanup session dir:', e.message);
        }
      }

      if (error && error.killed) {
        return res.json({ output: 'Error: Execution timed out (Possible infinite loop)', isError: true });
      }
      
      if (stderr) {
        return res.json({ output: stderr, isError: true });
      }

      return res.json({ output: stdout, isError: false });
    });
  } catch (err) {
    if (fs.existsSync(sessionDir)) {
      try {
        fs.rmSync(sessionDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
      } catch (e) {
        console.error('Failed to cleanup session dir:', e.message);
      }
    }
    console.error('Local Execution Error:', err);
    res.json({ output: 'Failed to execute code locally. ' + err.message, isError: true });
  }
});

// --- Code Execution with AI Evaluation API ---
app.post('/api/execute-ai', async (req, res) => {
  const { language, code, questionId } = req.body;
  if (!code) return res.status(400).json({ error: 'No code provided' });
  if (!questionId) return res.status(400).json({ error: 'No questionId provided' });

  // 1. Fetch Question Details
  const question = await Question.findByPk(questionId);
  if (!question) return res.status(404).json({ error: 'Question not found' });

  // 2. Execute Code via Judge0
  let languageId;
  switch (language) {
    case 'python': languageId = 71; break;
    case 'c': languageId = 50; break;
    case 'cpp': languageId = 54; break;
    case 'java': languageId = 62; break;
    default: return res.status(400).json({ error: 'Unsupported language' });
  }

  const apiKey = process.env.JUDGE0_API_KEY;
  let actualOutput = "";
  let isExecutionError = false;

  if (!apiKey || apiKey === 'YOUR_RAPIDAPI_KEY') {
    actualOutput = "Code execution skipped because Judge0 API key is missing. The AI will evaluate your code statically.";
    // We don't set isExecutionError = true, so the AI evaluation still runs.
  } else {
    try {
      const response = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
          'x-rapidapi-key': apiKey
        },
        body: JSON.stringify({
          source_code: code,
          language_id: languageId
        })
      });

      const result = await response.json();

      if (result.stdout !== null && result.stdout !== undefined) {
        actualOutput = result.stdout;
      } else if (result.stderr || result.compile_output) {
        actualOutput = result.stderr || result.compile_output;
        isExecutionError = true;
      } else {
        actualOutput = result.message || 'Execution finished with no output.';
        isExecutionError = !!result.message;
      }
    } catch (error) {
      console.error('Judge0 API Error:', error);
      actualOutput = 'Failed to execute code securely. ' + error.message;
      isExecutionError = true;
    }
  }

  // 3. AI Evaluation
  let aiFeedback = null;
  if (!isExecutionError) {
    aiFeedback = await evaluateCode(question.title, question.content, code, language, actualOutput);
  } else {
    aiFeedback = { isCorrect: false, feedback: "Compilation or Runtime error occurred. Please fix the errors first." };
  }

  return res.json({
    output: actualOutput,
    isError: isExecutionError,
    aiFeedback
  });
});

// --- Socket.io Logic ---
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // When a student or teacher joins an exam room
  socket.on('join_exam', ({ examId, role, name }) => {
    socket.join(`exam_${examId}`);
    socket.role = role;
    socket.examId = examId;
    socket.name = name || 'Student';
    console.log(`${role} ${name} joined exam_${examId}`);

    // If it's a student, notify the room
    if (role === 'student') {
      io.to(`exam_${examId}`).emit('student_joined', { socketId: socket.id, name });
    }
  });

  // Relay security warnings from student to teacher
  socket.on('security_warning', (data) => {
    // data: { examId, msg, time }
    io.to(`exam_${data.examId}`).emit('new_warning', {
      socketId: socket.id,
      name: socket.name,
      ...data
    });
  });

  // Relay video frames from student to teacher
  socket.on('video_frame', (data) => {
    // data: { examId, image } // image is a base64 string
    // Emit only to teachers in the room (or just broadcast to the room, the teacher UI will handle it)
    socket.to(`exam_${data.examId}`).emit('receive_video_frame', {
      socketId: socket.id,
      name: socket.name,
      image: data.image,
      hasSubmitted: socket.hasSubmitted,
      attempted: socket.attempted,
      total: socket.total
    });
  });

  // Relay screen frames from student to teacher
  socket.on('screen_frame', (data) => {
    socket.to(`exam_${data.examId}`).emit('receive_screen_frame', {
      socketId: socket.id,
      name: socket.name,
      screenImage: data.image
    });
  });

  // Handle live question addition by teacher
  socket.on('add_live_question', async ({ examId, title, content }) => {
    try {
      // Save to database
      const newQuestion = await Question.create({
        title,
        content,
        examId,
        isLive: true
      });
      // Broadcast to all students in the room
      io.to(`exam_${examId}`).emit('receive_live_question', newQuestion);
    } catch (err) {
      console.error("Error saving live question:", err);
    }
  });

  // Handle teacher audio (Push-to-Talk)
  socket.on('teacher_audio', (data) => {
    // data: { examId, targetSocketId, audioBase64 }
    if (data.targetSocketId === 'all') {
      // Broadcast to all students in the exam room
      socket.to(`exam_${data.examId}`).emit('receive_audio', {
        audioBase64: data.audioBase64
      });
    } else {
      // Direct message to a specific student
      io.to(data.targetSocketId).emit('receive_audio', {
        audioBase64: data.audioBase64
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    if (socket.role === 'student' && socket.examId) {
      io.to(`exam_${socket.examId}`).emit('student_left', { socketId: socket.id });
    }
  });

  // Handle student exam submission
  socket.on('submit_exam', (data) => {
    socket.hasSubmitted = true;
    socket.attempted = data.attempted;
    socket.total = data.total;
    io.to(`exam_${data.examId}`).emit('student_submitted', {
      socketId: socket.id,
      name: socket.name,
      attempted: data.attempted,
      total: data.total
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
