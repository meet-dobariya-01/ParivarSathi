const Application = require('../models/Application');
const FamilyMembership = require('../models/FamilyMembership');
const Family = require('../models/Family');

// Citizen applies for a scheme
const applyForScheme = async (req, res) => {
  try {
    const { scheme_id, applicant_person_id, remarks } = req.body;

    if (!scheme_id || !applicant_person_id) {
      return res.status(400).json({ message: 'scheme_id and applicant_person_id are required' });
    }

    // Verify current user belongs to an active family
    const membership = await FamilyMembership.findOne({
      person_id: req.user.person_id,
      status: 'ACTIVE'
    });

    if (!membership) {
      return res.status(400).json({ message: 'User does not belong to an active family' });
    }

    // Verify applicant_person_id is an active member of this family
    const applicantMembership = await FamilyMembership.findOne({
      family_id: membership.family_id,
      person_id: applicant_person_id,
      status: 'ACTIVE'
    });

    if (!applicantMembership) {
      return res.status(403).json({ message: 'Applicant is not an active member of your family' });
    }

    // Check if duplicate application already exists for this scheme and applicant
    const existing = await Application.findOne({
      scheme_id,
      applicant_person_id,
      status: { $in: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED'] }
    });

    if (existing) {
      return res.status(400).json({
        message: `An application is already active (${existing.status}) for this scheme and member.`
      });
    }

    const application = await Application.create({
      family_id: membership.family_id,
      scheme_id,
      applicant_person_id,
      status: 'SUBMITTED',
      remarks: remarks || 'Applied by citizen via ParivarSathi portal',
      submitted_at: new Date()
    });

    const populatedApp = await Application.findById(application._id)
      .populate('scheme_id', 'name department benefit_description')
      .populate('applicant_person_id', 'name gender');

    res.status(201).json(populatedApp);
  } catch (error) {
    console.error('Error applying for scheme:', error);
    res.status(500).json({ message: error.message });
  }
};

// Citizen retrieves all applications for their family
const getMyFamilyApplications = async (req, res) => {
  try {
    const membership = await FamilyMembership.findOne({
      person_id: req.user.person_id,
      status: 'ACTIVE'
    });

    if (!membership) {
      return res.json([]);
    }

    const applications = await Application.find({ family_id: membership.family_id })
      .populate('scheme_id', 'name department benefit_description required_documents')
      .populate('applicant_person_id', 'name gender occupation')
      .sort({ submitted_at: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Officer / Admin retrieves all applications across all families
const getAllApplications = async (req, res) => {
  try {
    const { status, scheme_id } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (scheme_id) filter.scheme_id = scheme_id;

    const applications = await Application.find(filter)
      .populate('scheme_id', 'name department')
      .populate('applicant_person_id', 'name gender mobile education occupation')
      .populate('family_id', 'family_id district taluka village annual_income')
      .sort({ submitted_at: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Officer updates application status (APPROVED / REJECTED / UNDER_REVIEW)
const reviewApplication = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const validStatuses = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    if (remarks !== undefined) {
      application.remarks = remarks;
    }
    application.updated_at = new Date();
    await application.save();

    const updated = await Application.findById(application._id)
      .populate('scheme_id', 'name department')
      .populate('applicant_person_id', 'name')
      .populate('family_id', 'family_id');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  applyForScheme,
  getMyFamilyApplications,
  getAllApplications,
  reviewApplication
};
