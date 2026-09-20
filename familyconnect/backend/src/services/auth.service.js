import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { ENV } from "../config/env.js";
import User from "../models/User.js";
import Person from "../models/Person.js";
import { createHttpError } from "../middleware/error.js";

export const sanitizeUser = (user) => {
  if (!user) return user;

  const plainUser = user.toJSON ? user.toJSON() : user.toObject ? user.toObject() : { ...user };
  const { passwordHash, __v, _id, ...safeUser } = plainUser;

  if (safeUser.personId && typeof safeUser.personId === "object") {
    if (safeUser.personId._bsontype === "ObjectId" || safeUser.personId.buffer) {
      safeUser.personId = safeUser.personId.toString();
    } else {
      const { __v: personV, _id: personId, ...person } = safeUser.personId;
      safeUser.personId = {
        ...person,
        ...(personId ? { id: personId.toString?.() || personId } : {}),
      };
    }
  }

  return { ...safeUser, id: safeUser.id || plainUser._id || user._id?.toString?.() };
};

export const createAccessToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role }, ENV.JWT_SECRET_KEY, {
    expiresIn: ENV.JWT_EXPIRES_IN,
  });

export const registerUser = async (payload) => {
  const { email, password, role = "CITIZEN", name, dateOfBirth, gender, mobile, occupation, education } = payload;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw createHttpError(409, "User already exists", "USER_EXISTS");
  }

  if (role === "OFFICER") {
    const existingOfficer = await User.findOne({ role: "OFFICER" });
    if (existingOfficer) {
      throw createHttpError(409, "Officer registration is closed", "OFFICER_EXISTS");
    }
  }

  let personId = null;

  if (role === "CITIZEN") {
    const person = await Person.create({
      name,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      mobile,
      occupation,
      education,
    });
    personId = person._id;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    email: email.toLowerCase(),
    passwordHash,
    role,
    personId,
    isActive: true,
  });

  const accessToken = createAccessToken(user);

  return {
    user: sanitizeUser(user),
    accessToken,
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash").populate("personId");

  if (!user) {
    throw createHttpError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    throw createHttpError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  const accessToken = createAccessToken(user);

  return {
    user: sanitizeUser(user),
    accessToken,
  };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).populate("personId");

  if (!user) {
    throw createHttpError(404, "User not found", "USER_NOT_FOUND");
  }

  return sanitizeUser(user);
};
