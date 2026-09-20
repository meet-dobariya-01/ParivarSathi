// services/auth.service.js
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
import User from "../models/User.js";
import Person from "../models/Person.js";

const generateToken = (id) =>
  jwt.sign({ id }, ENV.JWT_SECRET, { expiresIn: ENV.JWT_EXPIRES_IN });

export const registerService = async (body) => {
  const { email, password, name, date_of_birth, gender, mobile, occupation, education, role } = body;

  if (await User.findOne({ email })) throw { statusCode: 400, message: "Email already registered" };

  const person = await Person.create({
    name: name || "Citizen",
    date_of_birth: date_of_birth ? new Date(date_of_birth) : new Date("1995-01-01"),
    gender: gender || "Male",
    mobile: mobile || "",
    occupation: occupation || "",
    education: education || "",
  });

  const user = await User.create({
    email,
    password_hash: password,
    role: role === "OFFICER" ? "OFFICER" : "CITIZEN",
    person_id: person._id,
    is_active: true,
  });

  const token = generateToken(user._id);
  return { _id: user._id, email: user.email, role: user.role, person, token };
};

export const loginService = async ({ email, password }) => {
  const user = await User.findOne({ email }).populate("person_id");
  if (!user || !(await user.matchPassword(password))) {
    throw { statusCode: 401, message: "Invalid email or password" };
  }
  const token = generateToken(user._id);
  return { _id: user._id, email: user.email, role: user.role, person: user.person_id, token };
};
