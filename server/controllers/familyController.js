const crypto = require('crypto');
const Family = require('../models/Family');
const FamilyMembership = require('../models/FamilyMembership');
const Person = require('../models/Person');

// Helper to generate public Family ID like GJ-FAM-7K3P9X2M
const generateUniqueFamilyId = () => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // base32 without ambiguous chars (0, 1, I, O)
  let id = '';
  const bytes = crypto.randomBytes(8);
  for (let i = 0; i < 8; i++) {
    id += chars[bytes[i] % chars.length];
  }
  return `GJ-FAM-${id}`;
};

// Check current citizen's active family or get family profile
const getMyFamily = async (req, res) => {
  try {
    if (!req.user.person_id) {
      return res.status(400).json({ message: 'User is not linked to any person profile' });
    }

    const membership = await FamilyMembership.findOne({
      person_id: req.user.person_id,
      status: 'ACTIVE'
    });

    if (!membership) {
      return res.json({ hasFamily: false, family: null, members: [] });
    }

    const family = await Family.findById(membership.family_id).populate('family_head_person_id');
    if (!family) {
      return res.json({ hasFamily: false, family: null, members: [] });
    }

    const memberships = await FamilyMembership.find({
      family_id: family._id,
      status: 'ACTIVE'
    }).populate('person_id');

    const members = memberships.map(m => {
      const p = m.person_id ? (m.person_id.toObject ? m.person_id.toObject() : m.person_id) : {};
      return {
        membership_id: m._id,
        person_id: p._id,
        name: p.name,
        date_of_birth: p.date_of_birth,
        gender: p.gender,
        mobile: p.mobile,
        occupation: p.occupation,
        education: p.education,
        relationship: m.relationship,
        is_head: m.is_head,
        status: m.status,
        joined_at: m.joined_at
      };
    });

    res.json({
      hasFamily: true,
      family,
      members,
      memberCount: members.length
    });
  } catch (error) {
    console.error('Error in getMyFamily:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create a new Family and set current user as HEAD
const createFamily = async (req, res) => {
  try {
    const { annual_income, address, district, taluka, village } = req.body;

    if (!annual_income || !address || !district || !taluka || !village) {
      return res.status(400).json({ message: 'All family fields are required' });
    }

    // Check if citizen is already active in another family
    const existingMembership = await FamilyMembership.findOne({
      person_id: req.user.person_id,
      status: 'ACTIVE'
    });

    if (existingMembership) {
      return res.status(400).json({
        message: 'Business Rule Violation: A person can belong to only ONE active family at a time.'
      });
    }

    // Generate unique Family ID (e.g. GJ-FAM-7K3P9X2M)
    let family_id = generateUniqueFamilyId();
    let isUnique = false;
    while (!isUnique) {
      const existing = await Family.findOne({ family_id });
      if (!existing) isUnique = true;
      else family_id = generateUniqueFamilyId();
    }

    const family = await Family.create({
      family_id,
      family_head_person_id: req.user.person_id,
      annual_income: Number(annual_income),
      address,
      district,
      taluka,
      village
    });

    // Create HEAD membership
    await FamilyMembership.create({
      family_id: family._id,
      person_id: req.user.person_id,
      relationship: 'HEAD',
      is_head: true,
      status: 'ACTIVE',
      joined_at: new Date()
    });

    res.status(201).json({ message: 'Family created successfully', family });
  } catch (error) {
    console.error('Error in createFamily:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add a Member to current citizen's active family
const addMember = async (req, res) => {
  try {
    const { name, date_of_birth, gender, mobile, occupation, education, relationship } = req.body;

    if (!name || !date_of_birth || !gender || !relationship) {
      return res.status(400).json({ message: 'Name, date of birth, gender, and relationship are required' });
    }

    // Find current user's active family
    const userMembership = await FamilyMembership.findOne({
      person_id: req.user.person_id,
      status: 'ACTIVE'
    });

    if (!userMembership) {
      return res.status(400).json({ message: 'You must have an active family to add members' });
    }

    // Create person record
    const person = await Person.create({
      name,
      date_of_birth: new Date(date_of_birth),
      gender,
      mobile: mobile || '',
      occupation: occupation || '',
      education: education || ''
    });

    // Check business rule: A person can belong to only ONE active family at a time
    const existingActive = await FamilyMembership.findOne({
      person_id: person._id,
      status: 'ACTIVE'
    });

    if (existingActive) {
      return res.status(400).json({
        message: 'This person is already part of another active family.'
      });
    }

    const membership = await FamilyMembership.create({
      family_id: userMembership.family_id,
      person_id: person._id,
      relationship,
      is_head: relationship === 'HEAD',
      status: 'ACTIVE',
      joined_at: new Date()
    });

    res.status(201).json({
      message: 'Member added successfully',
      person,
      membership
    });
  } catch (error) {
    console.error('Error in addMember:', error);
    res.status(500).json({ message: error.message });
  }
};

// Edit Family details
const updateFamily = async (req, res) => {
  try {
    const userMembership = await FamilyMembership.findOne({
      person_id: req.user.person_id,
      status: 'ACTIVE'
    });

    if (!userMembership) {
      return res.status(404).json({ message: 'No active family found' });
    }

    const { annual_income, address, district, taluka, village } = req.body;

    const updated = await Family.findByIdAndUpdate(
      userMembership.family_id,
      { annual_income, address, district, taluka, village, updated_at: new Date() },
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove/deactivate member (sets status to INACTIVE and left_at to now)
const deactivateMember = async (req, res) => {
  try {
    const { membershipId } = req.params;

    const userMembership = await FamilyMembership.findOne({
      person_id: req.user.person_id,
      status: 'ACTIVE'
    });

    if (!userMembership) {
      return res.status(404).json({ message: 'No active family found' });
    }

    const memberToDeactivate = await FamilyMembership.findOne({
      _id: membershipId,
      family_id: userMembership.family_id
    });

    if (!memberToDeactivate) {
      return res.status(404).json({ message: 'Member not found in your family' });
    }

    if (memberToDeactivate.is_head) {
      return res.status(400).json({ message: 'Cannot deactivate Family Head directly' });
    }

    memberToDeactivate.status = 'INACTIVE';
    memberToDeactivate.left_at = new Date();
    await memberToDeactivate.save();

    res.json({ message: 'Member successfully deactivated', membership: memberToDeactivate });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Officer / Admin: Get all families with statistics
const getAllFamilies = async (req, res) => {
  try {
    const families = await Family.find().populate('family_head_person_id');
    const enriched = await Promise.all(families.map(async (fam) => {
      const memberCount = await FamilyMembership.countDocuments({
        family_id: fam._id,
        status: 'ACTIVE'
      });
      return {
        ...fam.toObject(),
        memberCount
      };
    }));

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyFamily,
  createFamily,
  addMember,
  updateFamily,
  deactivateMember,
  getAllFamilies
};
