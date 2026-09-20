import Family from "../models/Family.js";
import FamilyMembership from "../models/FamilyMembership.js";
import Person from "../models/Person.js";
import { createHttpError } from "../middleware/error.js";
import { generateFamilyId } from "../utils/familyId.js";

const getPersonId = (user) => {
  if (!user || !user.personId) return null;
  return user.personId._id ? user.personId._id.toString() : user.personId.toString();
};

const getFamilyMembers = async (familyId) =>
  FamilyMembership.find({ familyId, status: "ACTIVE" }).populate("personId").sort({ joinedAt: 1 });

const normalizeMobile = (value) => (value ? value.trim() : "");

export const getMyFamilyService = async (personId) => {
  const membership = await FamilyMembership.findOne({ personId, status: "ACTIVE" }).populate("familyId");

  if (!membership || !membership.familyId) {
    throw createHttpError(404, "No active family found", "FAMILY_NOT_FOUND");
  }

  const family = await Family.findById(membership.familyId._id).populate("familyHeadPersonId");
  const members = await getFamilyMembers(family._id);

  return {
    ...family.toObject(),
    members: members.map((member) => ({
      ...member.toObject(),
      person: member.personId,
    })),
  };
};

export const getFamilyByIdService = async (familyId) => {
  const family = await Family.findOne({ familyId }).populate("familyHeadPersonId");

  if (!family) {
    throw createHttpError(404, "Family not found", "FAMILY_NOT_FOUND");
  }

  const members = await getFamilyMembers(family._id);

  return {
    ...family.toObject(),
    members: members.map((member) => ({
      ...member.toObject(),
      person: member.personId,
    })),
  };
};

export const createFamilyService = async (user, payload) => {
  const personId = getPersonId(user);

  if (!personId) {
    throw createHttpError(400, "Citizen profile is missing a linked person", "PERSON_REQUIRED");
  }

  const existingFamilyMembership = await FamilyMembership.findOne({ personId, status: "ACTIVE" });
  if (existingFamilyMembership) {
    throw createHttpError(409, "Person already belongs to an active family", "ACTIVE_FAMILY_EXISTS");
  }

  let generatedFamilyId = generateFamilyId();
  let attempts = 0;
  while (attempts < 5 && (await Family.findOne({ familyId: generatedFamilyId }))) {
    generatedFamilyId = generateFamilyId();
    attempts += 1;
  }

  const family = await Family.create({
    familyId: generatedFamilyId,
    familyHeadPersonId: personId,
    annualIncome: Number(payload.annualIncome),
    address: payload.address || "",
    district: payload.district,
    taluka: payload.taluka || "",
    village: payload.village || "",
  });

  await FamilyMembership.create({
    familyId: family._id,
    personId,
    relationship: "HEAD",
    isHead: true,
    status: "ACTIVE",
    joinedAt: new Date(),
  });

  return getFamilyByIdService(family.familyId);
};

export const updateFamilyService = async (familyId, payload) => {
  const family = await Family.findOne({ familyId });
  if (!family) {
    throw createHttpError(404, "Family not found", "FAMILY_NOT_FOUND");
  }

  const update = {};
  if (payload.annualIncome !== undefined) update.annualIncome = Number(payload.annualIncome);
  if (payload.address !== undefined) update.address = payload.address || "";
  if (payload.district !== undefined) update.district = payload.district;
  if (payload.taluka !== undefined) update.taluka = payload.taluka || "";
  if (payload.village !== undefined) update.village = payload.village || "";

  const updatedFamily = await Family.findByIdAndUpdate(family._id, update, { new: true }).populate("familyHeadPersonId");
  return getFamilyByIdService(updatedFamily.familyId);
};

export const addFamilyMemberService = async ({ familyId, userPersonId, memberData }) => {
  const family = await Family.findOne({ familyId });
  if (!family) {
    throw createHttpError(404, "Family not found", "FAMILY_NOT_FOUND");
  }

  const ownerMembership = await FamilyMembership.findOne({ familyId: family._id, personId: userPersonId, status: "ACTIVE" });
  if (!ownerMembership) {
    throw createHttpError(403, "Only the family owner can add members", "FORBIDDEN");
  }

  const mobile = normalizeMobile(memberData.mobile);
  if (mobile) {
    const duplicatePerson = await Person.findOne({ mobile });
    if (duplicatePerson) {
      const duplicateMembership = await FamilyMembership.findOne({ personId: duplicatePerson._id, status: "ACTIVE" });
      if (duplicateMembership && duplicateMembership.familyId.toString() !== family._id.toString()) {
        throw createHttpError(409, "This person already belongs to another active family", "DUPLICATE_MEMBER");
      }
    }
  }

  const person = await Person.create({
    name: memberData.name,
    dateOfBirth: new Date(memberData.dateOfBirth),
    gender: memberData.gender,
    mobile: mobile || undefined,
    occupation: memberData.occupation || undefined,
    education: memberData.education || undefined,
  });

  const membership = await FamilyMembership.create({
    familyId: family._id,
    personId: person._id,
    relationship: memberData.relationship,
    isHead: false,
    status: "ACTIVE",
    joinedAt: new Date(),
  });

  return { person, membership };
};

export const getFamilyMembersService = async (familyId) => {
  const family = await Family.findOne({ familyId });
  if (!family) {
    throw createHttpError(404, "Family not found", "FAMILY_NOT_FOUND");
  }

  const memberships = await FamilyMembership.find({ familyId: family._id }).populate("personId").sort({ joinedAt: 1 });
  return memberships.map((membership) => ({
    ...membership.toObject(),
    person: membership.personId,
  }));
};

export const updateFamilyMemberService = async ({ familyId, memberId, userPersonId, updates }) => {
  const family = await Family.findOne({ familyId });
  if (!family) {
    throw createHttpError(404, "Family not found", "FAMILY_NOT_FOUND");
  }

  const ownerMembership = await FamilyMembership.findOne({ familyId: family._id, personId: userPersonId, status: "ACTIVE" });
  if (!ownerMembership) {
    throw createHttpError(403, "Only the family owner can update members", "FORBIDDEN");
  }

  const membership = await FamilyMembership.findOne({ _id: memberId, familyId: family._id });
  if (!membership) {
    throw createHttpError(404, "Membership not found", "MEMBERSHIP_NOT_FOUND");
  }

  if (updates.relationship) {
    membership.relationship = updates.relationship;
  }

  if (updates.name || updates.dateOfBirth || updates.gender || updates.mobile || updates.occupation || updates.education) {
    const person = await Person.findById(membership.personId);
    if (!person) {
      throw createHttpError(404, "Person not found", "PERSON_NOT_FOUND");
    }

    if (updates.name) person.name = updates.name;
    if (updates.dateOfBirth) person.dateOfBirth = new Date(updates.dateOfBirth);
    if (updates.gender) person.gender = updates.gender;
    if (updates.mobile !== undefined) person.mobile = updates.mobile || undefined;
    if (updates.occupation !== undefined) person.occupation = updates.occupation || undefined;
    if (updates.education !== undefined) person.education = updates.education || undefined;
    await person.save();
  }

  await membership.save();
  await membership.populate("personId");

  return membership;
};

export const deleteFamilyMemberService = async ({ familyId, memberId, userPersonId }) => {
  const family = await Family.findOne({ familyId });
  if (!family) {
    throw createHttpError(404, "Family not found", "FAMILY_NOT_FOUND");
  }

  const ownerMembership = await FamilyMembership.findOne({ familyId: family._id, personId: userPersonId, status: "ACTIVE" });
  if (!ownerMembership) {
    throw createHttpError(403, "Only the family owner can update members", "FORBIDDEN");
  }

  const membership = await FamilyMembership.findOne({ _id: memberId, familyId: family._id });
  if (!membership) {
    throw createHttpError(404, "Membership not found", "MEMBERSHIP_NOT_FOUND");
  }

  if (membership.isHead) {
    const activePeers = await FamilyMembership.countDocuments({ familyId: family._id, status: "ACTIVE", _id: { $ne: membership._id } });
    if (activePeers > 0) {
      throw createHttpError(400, "Cannot deactivate the family head while other active members exist", "HEAD_DEACTIVATION_BLOCKED");
    }
  }

  membership.status = "INACTIVE";
  membership.leftAt = new Date();
  await membership.save();

  return membership;
};
