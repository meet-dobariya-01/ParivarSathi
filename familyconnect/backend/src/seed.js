import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import { ENV } from "./config/env.js";
import Application from "./models/Application.js";
import Family from "./models/Family.js";
import FamilyMembership from "./models/FamilyMembership.js";
import Person from "./models/Person.js";
import Scheme from "./models/Scheme.js";
import SchemeRule from "./models/SchemeRule.js";
import User from "./models/User.js";
import { evaluateSchemeForFamily } from "./services/eligibilityService.js";
import { generateApplicationId } from "./utils/applicationId.js";
import { generateFamilyId } from "./utils/familyId.js";

const logSummary = async () => {
  const counts = {
    users: await User.countDocuments(),
    persons: await Person.countDocuments(),
    families: await Family.countDocuments(),
    memberships: await FamilyMembership.countDocuments(),
    schemes: await Scheme.countDocuments(),
    schemeRules: await SchemeRule.countDocuments(),
    applications: await Application.countDocuments(),
  };

  console.log("\nSeed summary:");
  console.log(JSON.stringify(counts, null, 2));
  console.log("\nSeeded login credentials:");
  console.log("Officer: officer@gujarat.gov.in / Officer@123");
  console.log("Citizen 1: citizen1@gujarat.gov.in / Citizen@123");
  console.log("Citizen 2: citizen2@gujarat.gov.in / Citizen@123");
  console.log("Citizen 3: citizen3@gujarat.gov.in / Citizen@123");
};

const dropCollections = async () => {
  if (ENV.NODE_ENV === "production") return;

  const db = mongoose.connection.db;
  if (!db) return;

  const collections = await db.listCollections().toArray();
  await Promise.all(collections.map((collection) => db.dropCollection(collection.name)));
  console.log("Dropped all collections for reseeding.");
};

const person = (name, dob, gender, occupation, education, mobile) => ({
  name,
  dateOfBirth: new Date(dob),
  gender,
  occupation,
  education,
  mobile,
});

const schemeDefinitions = [
  {
    name: "[DEMO DATA] Student Scholarship",
    department: "Education",
    description: "Support for students from economically weaker households to continue education and access essential study materials.",
    benefitDescription: "Tuition fee support and exam assistance for eligible students.",
    requiredDocuments: ["Student ID", "Family income proof", "School admission proof"],
    rules: [
      { appliesTo: "FAMILY", fieldName: "annual_income", operator: "<=", value: 300000 },
      { appliesTo: "MEMBER", fieldName: "education", operator: "==", value: "STUDENT" },
      { appliesTo: "MEMBER", fieldName: "age", operator: ">=", value: 16 },
    ],
  },
  {
    name: "[DEMO DATA] Farmer Assistance",
    department: "Agriculture",
    description: "Agriculture support for small and marginal farmers to sustain crop operations and household income.",
    benefitDescription: "Seasonal support for farmers and agricultural households.",
    requiredDocuments: ["Land records", "Income certificate", "Farmer registry"],
    rules: [
      { appliesTo: "MEMBER", fieldName: "occupation", operator: "==", value: "FARMER" },
      { appliesTo: "FAMILY", fieldName: "annual_income", operator: "<=", value: 500000 },
    ],
  },
  {
    name: "[DEMO DATA] Housing Assistance",
    department: "Housing",
    description: "Assistance for low-income households to secure basic shelter and improve living standards.",
    benefitDescription: "Housing grant support for eligible households.",
    requiredDocuments: ["Income proof", "Residence proof", "Construction estimate"],
    rules: [{ appliesTo: "FAMILY", fieldName: "annual_income", operator: "<=", value: 250000 }],
  },
  {
    name: "[DEMO DATA] Girl Child Education",
    department: "Women and Child Development",
    description: "Education support for girls in school-going age groups to ensure continuation and retention.",
    benefitDescription: "Scholarship and school support for eligible girl children.",
    requiredDocuments: ["Birth certificate", "School identity", "Guardian proof"],
    rules: [
      { appliesTo: "MEMBER", fieldName: "gender", operator: "==", value: "FEMALE" },
      { appliesTo: "MEMBER", fieldName: "education", operator: "==", value: "STUDENT" },
      { appliesTo: "MEMBER", fieldName: "age", operator: ">=", value: 6 },
      { appliesTo: "MEMBER", fieldName: "age", operator: "<=", value: 18 },
    ],
  },
  {
    name: "[DEMO DATA] Women Assistance",
    department: "Women and Child Development",
    description: "Support programs aimed at women from low-income households and vulnerable communities.",
    benefitDescription: "Financial and social welfare support for women in eligible households.",
    requiredDocuments: ["Income certificate", "Identity proof", "Residence proof"],
    rules: [
      { appliesTo: "MEMBER", fieldName: "gender", operator: "==", value: "FEMALE" },
      { appliesTo: "FAMILY", fieldName: "annual_income", operator: "<=", value: 300000 },
    ],
  },
  {
    name: "[DEMO DATA] Skill Development",
    department: "Skill Development",
    description: "Vocational training and employability support for youth and working adults.",
    benefitDescription: "Skill training support and stipends for eligible learners.",
    requiredDocuments: ["Age proof", "Certificate copy", "Training enrollment form"],
    rules: [
      { appliesTo: "MEMBER", fieldName: "age", operator: ">=", value: 18 },
      { appliesTo: "MEMBER", fieldName: "age", operator: "<=", value: 45 },
    ],
  },
  {
    name: "[DEMO DATA] Senior Citizen Assistance",
    department: "Social Justice",
    description: "Support for senior citizens with pension assistance and community welfare services.",
    benefitDescription: "Financial assistance and social care for eligible senior citizens.",
    requiredDocuments: ["Age proof", "Residence proof", "Bank account details"],
    rules: [{ appliesTo: "MEMBER", fieldName: "age", operator: ">=", value: 60 }],
  },
  {
    name: "[DEMO DATA] Agriculture Equipment Assistance",
    department: "Agriculture",
    description: "Capital subsidies for farmer households to invest in farming equipment and mechanization.",
    benefitDescription: "Subsidy support for equipment purchase and mechanization.",
    requiredDocuments: ["Farm records", "Income certificate", "Equipment quote"],
    rules: [
      { appliesTo: "MEMBER", fieldName: "occupation", operator: "==", value: "FARMER" },
      { appliesTo: "FAMILY", fieldName: "annual_income", operator: "<=", value: 400000 },
    ],
  },
  {
    name: "[DEMO DATA] Education Support",
    department: "Education",
    description: "Education support for households aiming to continue secondary or higher-level learning.",
    benefitDescription: "Tuition support and educational aid for eligible students.",
    requiredDocuments: ["Previous marksheet", "Income proof", "School certificate"],
    rules: [{ appliesTo: "MEMBER", fieldName: "education", operator: "IN", value: ["SSC", "HSC", "GRADUATE"] }],
  },
  {
    name: "[DEMO DATA] Rural Housing",
    department: "Rural Development",
    description: "Housing subsidy for rural and semi-urban families with limited incomes.",
    benefitDescription: "Shelter support for vulnerable rural households.",
    requiredDocuments: ["District proof", "Residence proof", "Income certificate"],
    rules: [
      { appliesTo: "FAMILY", fieldName: "district", operator: "IN", value: ["Surendranagar", "Rajkot", "Bhavnagar"] },
      { appliesTo: "FAMILY", fieldName: "annual_income", operator: "<=", value: 200000 },
    ],
  },
];

const seed = async () => {
  try {
    await connectDB();
    await dropCollections();

    const officerPerson = await Person.create(
      person("Officer Placeholder", "1985-04-12", "MALE", "Government Officer", "GRADUATE", "9999999001")
    );

    const officer = await User.create({
      email: "officer@gujarat.gov.in",
      passwordHash: await bcrypt.hash("Officer@123", 10),
      role: "OFFICER",
      personId: officerPerson._id,
      isActive: true,
    });

    const citizen1 = await User.create({
      email: "citizen1@gujarat.gov.in",
      passwordHash: await bcrypt.hash("Citizen@123", 10),
      role: "CITIZEN",
      personId: (await Person.create(person("Rajesh Patel", "1983-06-15", "MALE", "Private Job", "GRADUATE", "9876500001")))._id,
      isActive: true,
    });

    const citizen2 = await User.create({
      email: "citizen2@gujarat.gov.in",
      passwordHash: await bcrypt.hash("Citizen@123", 10),
      role: "CITIZEN",
      personId: (await Person.create(person("Meena Shah", "1988-02-20", "FEMALE", "Teacher", "POST_GRADUATE", "9876500002")))._id,
      isActive: true,
    });

    const citizen3 = await User.create({
      email: "citizen3@gujarat.gov.in",
      passwordHash: await bcrypt.hash("Citizen@123", 10),
      role: "CITIZEN",
      personId: (await Person.create(person("Kiran Desai", "1990-11-05", "MALE", "Business", "GRADUATE", "9876500003")))._id,
      isActive: true,
    });

    const headUserPersons = {
      citizen1: citizen1.personId,
      citizen2: citizen2.personId,
      citizen3: citizen3.personId,
    };

    const familyDesigns = [
      { district: "Rajkot", taluka: "Jetpur", village: "Mota", annualIncome: 220000, head: headUserPersons.citizen1, members: [
        { relationship: "HEAD", isHead: true, person: person("Rajesh Patel", "1983-06-15", "MALE", "Private Job", "GRADUATE", "9876500001") },
        { relationship: "SPOUSE", isHead: false, person: person("Anita Patel", "1987-09-08", "FEMALE", "Teacher", "HSC", "9876500011") },
        { relationship: "SON", isHead: false, person: person("Aayush Patel", "2008-04-25", "MALE", "Student", "STUDENT", "9876500012") },
        { relationship: "DAUGHTER", isHead: false, person: person("Jiya Patel", "2012-12-18", "FEMALE", "Student", "STUDENT", "9876500013") },
      ] },
      { district: "Ahmedabad", taluka: "Ghatlodia", village: "Bopal", annualIncome: 420000, head: headUserPersons.citizen2, members: [
        { relationship: "HEAD", isHead: true, person: person("Meena Shah", "1988-02-20", "FEMALE", "Teacher", "POST_GRADUATE", "9876500002") },
        { relationship: "SPOUSE", isHead: false, person: person("Nilesh Shah", "1984-07-11", "MALE", "FARMER", "HSC", "9876500021") },
        { relationship: "SON", isHead: false, person: person("Kunal Shah", "2010-03-02", "MALE", "Student", "STUDENT", "9876500022") },
        { relationship: "DAUGHTER", isHead: false, person: person("Pooja Shah", "2015-09-14", "FEMALE", "Student", "STUDENT", "9876500023") },
      ] },
      { district: "Surendranagar", taluka: "Wadhwan", village: "Dhrangadhra", annualIncome: 180000, head: headUserPersons.citizen3, members: [
        { relationship: "HEAD", isHead: true, person: person("Kiran Desai", "1990-11-05", "MALE", "Business", "GRADUATE", "9876500003") },
        { relationship: "SPOUSE", isHead: false, person: person("Rupali Desai", "1993-10-01", "FEMALE", "Homemaker", "HSC", "9876500031") },
        { relationship: "SON", isHead: false, person: person("Aniket Desai", "2013-02-11", "MALE", "Student", "STUDENT", "9876500032") },
      ] },
      { district: "Bhavnagar", taluka: "Ghogha", village: "Tana", annualIncome: 260000, head: null, members: [
        { relationship: "HEAD", isHead: true, person: person("Hardik Bhatt", "1982-05-18", "MALE", "FARMER", "SSC", "9876500101") },
        { relationship: "SPOUSE", isHead: false, person: person("Mita Bhatt", "1986-01-14", "FEMALE", "Homemaker", "HSC", "9876500102") },
        { relationship: "DAUGHTER", isHead: false, person: person("Sonal Bhatt", "2006-08-09", "FEMALE", "Student", "STUDENT", "9876500103") },
      ] },
      { district: "Surat", taluka: "Karanj", village: "Nandol", annualIncome: 310000, head: null, members: [
        { relationship: "HEAD", isHead: true, person: person("Jayesh Joshi", "1979-07-09", "MALE", "Shopkeeper", "HSC", "9876500111") },
        { relationship: "SPOUSE", isHead: false, person: person("Sujata Joshi", "1982-12-17", "FEMALE", "Tailor", "HSC", "9876500112") },
        { relationship: "SON", isHead: false, person: person("Dhruv Joshi", "2004-03-05", "MALE", "Student", "STUDENT", "9876500113") },
        { relationship: "DAUGHTER", isHead: false, person: person("Nisha Joshi", "2011-11-27", "FEMALE", "Student", "STUDENT", "9876500114") },
      ] },
      { district: "Vadodara", taluka: "Padra", village: "Sankarda", annualIncome: 175000, head: null, members: [
        { relationship: "HEAD", isHead: true, person: person("Rakesh Vora", "1975-04-16", "MALE", "Driver", "SSC", "9876500121") },
        { relationship: "SPOUSE", isHead: false, person: person("Kalpana Vora", "1978-09-02", "FEMALE", "Housewife", "HSC", "9876500122") },
        { relationship: "SON", isHead: false, person: person("Pratik Vora", "2007-06-19", "MALE", "Student", "STUDENT", "9876500123") },
      ] },
      { district: "Rajkot", taluka: "Madhapar", village: "Lodhika", annualIncome: 340000, head: null, members: [
        { relationship: "HEAD", isHead: true, person: person("Chaitanya Rana", "1981-03-30", "MALE", "FARMER", "SSC", "9876500131") },
        { relationship: "SPOUSE", isHead: false, person: person("Lata Rana", "1985-08-22", "FEMALE", "Teacher", "HSC", "9876500132") },
        { relationship: "SON", isHead: false, person: person("Manav Rana", "2009-01-16", "MALE", "Student", "STUDENT", "9876500133") },
        { relationship: "DAUGHTER", isHead: false, person: person("Ritika Rana", "2017-10-26", "FEMALE", "Student", "STUDENT", "9876500134") },
      ] },
      { district: "Ahmedabad", taluka: "Naroda", village: "Narol", annualIncome: 270000, head: null, members: [
        { relationship: "HEAD", isHead: true, person: person("Nitin Solanki", "1978-12-03", "MALE", "Small Business", "GRADUATE", "9876500141") },
        { relationship: "SPOUSE", isHead: false, person: person("Pallavi Solanki", "1980-06-20", "FEMALE", "Clerk", "HSC", "9876500142") },
        { relationship: "SON", isHead: false, person: person("Mihir Solanki", "2005-05-27", "MALE", "Student", "STUDENT", "9876500143") },
        { relationship: "DAUGHTER", isHead: false, person: person("Sakshi Solanki", "2010-02-12", "FEMALE", "Student", "STUDENT", "9876500144") },
      ] },
    ];

    const createdFamilies = [];
    for (const design of familyDesigns) {
      const family = await Family.create({
        familyId: generateFamilyId(),
        familyHeadPersonId: design.head || (await Person.create(design.members[0].person))._id,
        annualIncome: design.annualIncome,
        address: `${design.village}, ${design.district}`,
        district: design.district,
        taluka: design.taluka,
        village: design.village,
      });

      for (const member of design.members) {
        let personId = design.head && member.relationship === "HEAD" ? design.head : null;

        if (!personId) {
          const personDoc = await Person.create(member.person);
          personId = personDoc._id;
        }

        await FamilyMembership.create({
          familyId: family._id,
          personId,
          relationship: member.relationship,
          isHead: member.isHead,
          status: "ACTIVE",
          joinedAt: new Date(),
        });
      }

      createdFamilies.push(family);
    }

    const schemeDocuments = [];
    for (const definition of schemeDefinitions) {
      const scheme = await Scheme.create({
        name: definition.name,
        department: definition.department,
        description: definition.description,
        benefitDescription: definition.benefitDescription,
        requiredDocuments: definition.requiredDocuments,
        isActive: true,
      });

      await SchemeRule.insertMany(
        definition.rules.map((rule) => ({
          schemeId: scheme._id,
          ...rule,
        }))
      );

      schemeDocuments.push(scheme);
    }

    const applicationSpecs = [
      { familyIndex: 0, schemeIndex: 0, status: "SUBMITTED" },
      { familyIndex: 1, schemeIndex: 1, status: "SUBMITTED" },
      { familyIndex: 2, schemeIndex: 2, status: "SUBMITTED" },
      { familyIndex: 3, schemeIndex: 3, status: "UNDER_REVIEW" },
      { familyIndex: 4, schemeIndex: 4, status: "UNDER_REVIEW" },
      { familyIndex: 5, schemeIndex: 5, status: "APPROVED" },
      { familyIndex: 6, schemeIndex: 6, status: "APPROVED" },
      { familyIndex: 7, schemeIndex: 7, status: "APPROVED" },
      { familyIndex: 0, schemeIndex: 8, status: "REJECTED" },
      { familyIndex: 1, schemeIndex: 9, status: "REJECTED" },
    ];

    for (const [index, spec] of applicationSpecs.entries()) {
      const family = createdFamilies[spec.familyIndex];
      const scheme = schemeDocuments[spec.schemeIndex];
      const headPerson = family.familyHeadPersonId;
      const eligibilityResult = await evaluateSchemeForFamily(family.familyId, scheme._id.toString());

      await Application.create({
        applicationId: generateApplicationId(),
        familyId: family._id,
        schemeId: scheme._id,
        applicantPersonId: headPerson,
        status: spec.status,
        submittedAt: new Date(Date.now() - (index + 1) * 86400000),
        reviewedAt: spec.status === "SUBMITTED" ? null : new Date(Date.now() - index * 3600000),
        reviewedBy: spec.status === "SUBMITTED" ? null : officer._id,
        remarks: spec.status === "REJECTED"
          ? "Supporting documents did not match the scheme policy requirements."
          : spec.status === "APPROVED"
            ? "Documents verified and family met the scheme eligibility criteria."
            : spec.status === "UNDER_REVIEW"
              ? "Application is under officer review for document verification."
              : "Application submitted and pending review.",
        eligibilityResult,
      });
    }

    await logSummary();
    console.log("\nSeeded officer and demo citizen accounts successfully.");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seed();
