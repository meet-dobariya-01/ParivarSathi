const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const familyRoutes = require('./routes/family');
const schemeRoutes = require('./routes/scheme');
const applicationRoutes = require('./routes/application');
const eligibilityRoutes = require('./routes/eligibility');
const officerRoutes = require('./routes/officer');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/scheme', schemeRoutes);
app.use('/api/application', applicationRoutes);
app.use('/api/eligibility', eligibilityRoutes);
app.use('/api/officer', officerRoutes);
app.use('/api/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
