// services/family.service.js
import Family from "../models/Family.js";
import FamilyMembership from "../models/FamilyMembership.js";
import Person from "../models/Person.js";
import { generateFamilyId } from "../utils/familyId.js";

export const getMyFamilyService = async (personId) => {
  const membership = await FamilyMembership.findOne({ person_id: personId, status: "ACTIVE" });
  if (!membership) return { hasFamily: false, family: null, members: [] };

  const family = await Family.findById(membership.family_id).populate("family_head_person_id");
  const memberships = await FamilyMembership.find({ family_id: family._id, status: "ACTIVE" }).populate("person_id");

  const members = memberships.map((m) => ({
    membership_id: m._id,
    person_id: m.person_id?._id,
    name: m.person_id?.name,
    date_of_birth: m.person_id?.date_of_birth,
    gender: m.person_id?.gender,
    mobile: m.person_id?.mobile,
    occupation: m.person_id?.occupation,
    education: m.person_id?.education,
    relationship: m.relationship,
    is_head: m.is_head,
    status: m.status,
    joined_at: m.joined_at,
  }));

  return { hasFamily: true, family, members, memberCount: members.length };
};

export const createFamilyService = async (personId, data) => {
  const existing = await FamilyMembership.findOne({ person_id: personId, status: "ACTIVE" });
  if (existing) throw { statusCode: 400, message: "Business Rule: Person already belongs to an active family" };

  let family_id = generateFamilyId();
  while (await Family.findOne({ family_id })) family_id = generateFamilyId();

  const family = await Family.create({ ...data, family_id, family_head_person_id: personId, annual_income: Number(data.annual_income) });
  await FamilyMembership.create({ family_id: family._id, person_id: personId, relationship: "HEAD", is_head: true, status: "ACTIVE" });
  return family;
};

export const addMemberService = async (userPersonId, memberData) => {
  const userMembership = await FamilyMembership.findOne({ person_id: userPersonId, status: "ACTIVE" });
  if (!userMembership) throw { statusCode: 400, message: "You must have an active family to add members" };

  const person = await Person.create({ ...memberData, date_of_birth: new Date(memberData.date_of_birth) });
  await FamilyMembership.create({
    family_id: userMembership.family_id,
    person_id: person._id,
    relationship: memberData.relationship,
    is_head: false,
    status: "ACTIVE",
  });
  return person;
};

export const updateFamilyService = async (personId, data) => {
  const membership = await FamilyMembership.findOne({ person_id: personId, status: "ACTIVE" });
  if (!membership) throw { statusCode: 404, message: "No active family found" };
  return Family.findByIdAndUpdate(membership.family_id, data, { new: true });
};

export const deactivateMemberService = async (userPersonId, membershipId) => {
  const userMembership = await FamilyMembership.findOne({ person_id: userPersonId, status: "ACTIVE" });
  if (!userMembership) throw { statusCode: 404, message: "No active family" };

  const m = await FamilyMembership.findOne({ _id: membershipId, family_id: userMembership.family_id });
  if (!m) throw { statusCode: 404, message: "Member not found in your family" };
  if (m.is_head) throw { statusCode: 400, message: "Cannot deactivate the family head" };

  m.status = "INACTIVE";
  m.left_at = new Date();
  await m.save();
  return m;
};

export const getAllFamiliesService = async () => {
  const families = await Family.find().populate("family_head_person_id");
  return Promise.all(families.map(async (f) => ({
    ...f.toObject(),
    memberCount: await FamilyMembership.countDocuments({ family_id: f._id, status: "ACTIVE" }),
  })));
};
