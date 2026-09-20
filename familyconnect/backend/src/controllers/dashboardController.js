import Application from "../models/Application.js";
import Family from "../models/Family.js";
import FamilyMembership from "../models/FamilyMembership.js";

const ALL_STATUSES = ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED"];

export const getDashboardSummary = async (req, res, next) => {
  try {
    const [familyStats, memberStats, applicationStats] = await Promise.all([
      Family.aggregate([{ $group: { _id: null, totalFamilies: { $sum: 1 } } }]),
      FamilyMembership.aggregate([
        { $match: { status: "ACTIVE" } },
        { $group: { _id: null, totalMembers: { $sum: 1 } } },
      ]),
      Application.aggregate([
        {
          $group: {
            _id: null,
            totalApplications: { $sum: 1 },
            pendingApplications: {
              $sum: {
                $cond: [{ $in: ["$status", ["SUBMITTED", "UNDER_REVIEW"]] }, 1, 0],
              },
            },
            approvedApplications: {
              $sum: { $cond: [{ $eq: ["$status", "APPROVED"] }, 1, 0] },
            },
            rejectedApplications: {
              $sum: { $cond: [{ $eq: ["$status", "REJECTED"] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    const summary = {
      totalFamilies: familyStats[0]?.totalFamilies ?? 0,
      totalMembers: memberStats[0]?.totalMembers ?? 0,
      totalApplications: applicationStats[0]?.totalApplications ?? 0,
      pendingApplications: applicationStats[0]?.pendingApplications ?? 0,
      approvedApplications: applicationStats[0]?.approvedApplications ?? 0,
      rejectedApplications: applicationStats[0]?.rejectedApplications ?? 0,
    };

    return res.json(summary);
  } catch (error) {
    return next(error);
  }
};

export const getApplicationsByScheme = async (req, res, next) => {
  try {
    const results = await Application.aggregate([
      { $group: { _id: "$schemeId", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      {
        $lookup: {
          from: "schemes",
          localField: "_id",
          foreignField: "_id",
          as: "scheme",
        },
      },
      { $unwind: { path: "$scheme", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          schemeId: { $toString: "$_id" },
          schemeName: { $ifNull: ["$scheme.name", "Unknown Scheme"] },
          count: 1,
        },
      },
    ]);

    return res.json(results);
  } catch (error) {
    return next(error);
  }
};

export const getApplicationsByStatus = async (req, res, next) => {
  try {
    const results = await Application.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { _id: 0, status: "$_id", count: 1 } },
    ]);

    const countsByStatus = new Map(results.map((row) => [row.status, row.count]));
    const payload = ALL_STATUSES.map((status) => ({ status, count: countsByStatus.get(status) ?? 0 }));

    return res.json(payload);
  } catch (error) {
    return next(error);
  }
};

export const getFamiliesByDistrict = async (req, res, next) => {
  try {
    const results = await Family.aggregate([
      { $group: { _id: "$district", count: { $sum: 1 } } },
      { $project: { _id: 0, district: "$_id", count: 1 } },
      { $sort: { count: -1, district: 1 } },
    ]);

    return res.json(results);
  } catch (error) {
    return next(error);
  }
};
