const Family = require('../models/Family');
const FamilyMembership = require('../models/FamilyMembership');
const Application = require('../models/Application');
const Scheme = require('../models/Scheme');

// Officer Dashboard KPI Stats & Charts Aggregation
const getOfficerStats = async (req, res) => {
  try {
    const totalFamilies = await Family.countDocuments();
    const totalMembers = await FamilyMembership.countDocuments({ status: 'ACTIVE' });
    const totalApplications = await Application.countDocuments();

    const pendingApplications = await Application.countDocuments({
      status: { $in: ['SUBMITTED', 'UNDER_REVIEW', 'DRAFT'] }
    });
    const approvedApplications = await Application.countDocuments({ status: 'APPROVED' });
    const rejectedApplications = await Application.countDocuments({ status: 'REJECTED' });

    // Chart 1: Applications by Scheme
    const applicationsBySchemeAgg = await Application.aggregate([
      {
        $group: {
          _id: '$scheme_id',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'schemes',
          localField: '_id',
          foreignField: '_id',
          as: 'scheme'
        }
      },
      {
        $unwind: '$scheme'
      },
      {
        $project: {
          _id: 0,
          schemeName: '$scheme.name',
          applications: '$count'
        }
      }
    ]);

    // Chart 2: Status distribution
    const statusDistributionAgg = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1
        }
      }
    ]);

    // Chart 3: Families by District
    const familiesByDistrictAgg = await Family.aggregate([
      {
        $group: {
          _id: '$district',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          district: '$_id',
          families: '$count'
        }
      },
      { $sort: { families: -1 } }
    ]);

    res.json({
      kpis: {
        totalFamilies,
        totalMembers,
        totalApplications,
        pendingApplications,
        approvedApplications,
        rejectedApplications
      },
      charts: {
        applicationsByScheme: applicationsBySchemeAgg,
        statusDistribution: statusDistributionAgg,
        familiesByDistrict: familiesByDistrictAgg
      }
    });
  } catch (error) {
    console.error('Error fetching officer stats:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getOfficerStats };
