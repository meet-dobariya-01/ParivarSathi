// utils/familyId.js
import crypto from "crypto";

export const generateFamilyId = () => {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = crypto.randomBytes(8);
  let id = "";
  for (let i = 0; i < 8; i++) {
    id += chars[bytes[i] % chars.length];
  }
  return `GJ-FAM-${id}`;
};
