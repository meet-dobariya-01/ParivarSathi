const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Person = require('../models/Person');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'parivarsathi_secret_jwt_key_hackathon_2026', {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, date_of_birth, gender, mobile, occupation, education } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const assignedRole = (role && role.toUpperCase() === 'OFFICER') ? 'OFFICER' : 'CITIZEN';

    // Create associated person record
    const person = await Person.create({
      name: name || 'Citizen User',
      date_of_birth: date_of_birth ? new Date(date_of_birth) : new Date('1995-01-01'),
      gender: gender || 'Male',
      mobile: mobile || '',
      occupation: occupation || '',
      education: education || ''
    });

    const user = await User.create({
      email,
      password_hash: password, // Mongoose pre-save hook will hash password_hash
      role: assignedRole,
      person_id: person._id,
      is_active: true
    });

    res.status(201).json({
      _id: user._id,
      email: user.email,
      role: user.role,
      person: {
        _id: person._id,
        name: person.name,
        gender: person.gender,
        date_of_birth: person.date_of_birth
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('person_id');

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        email: user.email,
        role: user.role,
        person: user.person_id ? {
          _id: user.person_id._id,
          name: user.person_id.name,
          date_of_birth: user.person_id.date_of_birth,
          gender: user.person_id.gender,
          mobile: user.person_id.mobile,
          occupation: user.person_id.occupation,
          education: user.person_id.education,
        } : null,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password_hash').populate('person_id');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getMe };
