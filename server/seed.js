const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const Person = require('./models/Person');
const Family = require('./models/Family');
const FamilyMembership = require('./models/FamilyMembership');
const Scheme = require('./models/Scheme');
const SchemeRule = require('./models/SchemeRule');
const Application = require('./models/Application');

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas successfully.');
    console.log('Connecting to MongoDB & clearing existing collections...');
    await User.deleteMany();
    await Person.deleteMany();
    await Family.deleteMany();
    await FamilyMembership.deleteMany();
    await Scheme.deleteMany();
    await SchemeRule.deleteMany();
    await Application.deleteMany();

    // 1. OFFICER
    const officerPerson = await Person.create({
      name: 'Dr. Harshil Mehta',
      date_of_birth: new Date('1982-04-12'),
      gender: 'Male',
      mobile: '9825012345',
      occupation: 'District Welfare Officer',
      education: 'Post Graduate',
    });

    await User.create({
      email: 'officer@gujarat.gov.in',
      password_hash: 'password123',
      role: 'OFFICER',
      person_id: officerPerson._id,
      is_active: true,
    });

    // 2. CITIZEN 1: Rajesh Kumar & Household
    const rajesh = await Person.create({
      name: 'Rajesh Kumar Patel',
      date_of_birth: new Date('1988-06-15'), // Age ~38
      gender: 'Male',
      mobile: '9876543210',
      occupation: 'Farmer',
      education: 'High School',
    });

    const sunita = await Person.create({
      name: 'Sunita Patel',
      date_of_birth: new Date('1990-09-22'), // Age ~36
      gender: 'Female',
      mobile: '9876543211',
      occupation: 'Homemaker',
      education: '10th Pass',
    });

    const amit = await Person.create({
      name: 'Amit Patel',
      date_of_birth: new Date('2007-03-10'), // Age 19
      gender: 'Male',
      mobile: '9876543212',
      occupation: 'Student',
      education: 'STUDENT',
    });

    const pooja = await Person.create({
      name: 'Pooja Patel',
      date_of_birth: new Date('2012-11-05'), // Age 13
      gender: 'Female',
      mobile: '9876543213',
      occupation: 'Student',
      education: 'STUDENT',
    });

    await User.create({
      email: 'rajesh@gmail.com',
      password_hash: 'password123',
      role: 'CITIZEN',
      person_id: rajesh._id,
      is_active: true,
    });

    const family1 = await Family.create({
      family_id: 'GJ-FAM-7K3P9X2M',
      family_head_person_id: rajesh._id,
      annual_income: 180000,
      address: 'Plot 42, Kisan Nagar',
      district: 'Surendranagar',
      taluka: 'Wadhwan',
      village: 'Kherali',
    });

    await FamilyMembership.insertMany([
      { family_id: family1._id, person_id: rajesh._id, relationship: 'HEAD', is_head: true, status: 'ACTIVE' },
      { family_id: family1._id, person_id: sunita._id, relationship: 'SPOUSE', is_head: false, status: 'ACTIVE' },
      { family_id: family1._id, person_id: amit._id, relationship: 'SON', is_head: false, status: 'ACTIVE' },
      { family_id: family1._id, person_id: pooja._id, relationship: 'DAUGHTER', is_head: false, status: 'ACTIVE' },
    ]);

    // 3. CITIZEN 2: Priya Sharma & Household
    const priya = await Person.create({
      name: 'Priya Sharma',
      date_of_birth: new Date('1994-08-20'), // Age ~32
      gender: 'Female',
      mobile: '9876500001',
      occupation: 'Teacher',
      education: 'Bachelor of Education',
    });

    const kishore = await Person.create({
      name: 'Kishore Sharma',
      date_of_birth: new Date('1958-02-14'), // Age ~68 (Senior Citizen)
      gender: 'Male',
      mobile: '9876500002',
      occupation: 'Retired',
      education: 'Graduate',
    });

    await User.create({
      email: 'priya@gmail.com',
      password_hash: 'password123',
      role: 'CITIZEN',
      person_id: priya._id,
      is_active: true,
    });

    const family2 = await Family.create({
      family_id: 'GJ-FAM-9A2B4C6D',
      family_head_person_id: priya._id,
      annual_income: 120000,
      address: 'Flat 304, Shanti Heights',
      district: 'Ahmedabad',
      taluka: 'City',
      village: 'Navrangpura',
    });

    await FamilyMembership.insertMany([
      { family_id: family2._id, person_id: priya._id, relationship: 'HEAD', is_head: true, status: 'ACTIVE' },
      { family_id: family2._id, person_id: kishore._id, relationship: 'FATHER', is_head: false, status: 'ACTIVE' },
    ]);

    // 4. DEMO SCHEMES (8-10 Schemes)
    const schemeData = [
      {
        name: 'Student Scholarship',
        department: 'Education Department',
        description: 'Financial assistance for college & higher secondary students belonging to lower/middle income families in Gujarat.',
        benefit_description: '₹12,000 per academic year directly into student bank account.',
        required_documents: 'Income Certificate, College ID / Admission Letter, Marksheet',
        is_active: true,
      },
      {
        name: 'Farmer Assistance',
        department: 'Agriculture & Cooperation Department',
        description: 'Direct cash assistance for small and marginal farmers for organic fertilizers and seeds.',
        benefit_description: '₹6,000 per year in 3 installments.',
        required_documents: '7/12 Land Record, Farmer Registry Card',
        is_active: true,
      },
      {
        name: 'Housing Assistance (PMAY-Gramin)',
        department: 'Rural Development Department',
        description: 'Financial aid to construct permanent pucca houses for low-income rural households.',
        benefit_description: '₹1,20,000 grant for construction.',
        required_documents: 'BPL Card / Income Certificate, Land Ownership Proof',
        is_active: true,
      },
      {
        name: 'Girl Child Education Assistance (Kanya Kelavani)',
        department: 'Women & Child Development',
        description: 'Special encouragement grant to keep female students enrolled through higher education.',
        benefit_description: '₹5,000 annual scholarship + free bicycle.',
        required_documents: 'School Enrolment Certificate, Birth Certificate',
        is_active: true,
      },
      {
        name: 'Women Assistance (Ganga Swarupa)',
        department: 'Social Justice & Empowerment',
        description: 'Social security and livelihood support for adult women in need.',
        benefit_description: '₹1,250 monthly pension.',
        required_documents: 'Income Certificate, Age Verification',
        is_active: true,
      },
      {
        name: 'Skill Development Assistance',
        department: 'Labor & Employment Department',
        description: 'Free vocational course enrollments in ITIs with monthly training allowances.',
        benefit_description: 'Free Certification Course + ₹1,500 monthly stipend.',
        required_documents: '10th/12th Passing Certificate',
        is_active: true,
      },
      {
        name: 'Senior Citizen Assistance (Vrudh Pension)',
        department: 'Social Justice & Empowerment',
        description: 'Monthly old age pension assistance for citizens aged 60 and above.',
        benefit_description: '₹1,000 monthly direct bank transfer.',
        required_documents: 'Age Proof (Birth Certificate/Electoral Card), Bank Passbook',
        is_active: true,
      },
      {
        name: 'Agriculture Equipment Assistance',
        department: 'Agriculture Department',
        description: 'Subsidy on purchasing mechanized agricultural tools and solar water pumps.',
        benefit_description: 'Up to 50% capital subsidy (maximum ₹45,000).',
        required_documents: 'Kisan Card, Equipment Quotation',
        is_active: true,
      },
      {
        name: 'Education Support for Marginalized Groups',
        department: 'Tribal Development',
        description: 'Full tuition fee reimbursement and hostel facility support for poor families.',
        benefit_description: '100% Tuition Waiver + Free Books.',
        required_documents: 'Caste Certificate, Income Certificate',
        is_active: true,
      },
      {
        name: 'Rural Housing Assistance',
        department: 'Panchayat & Rural Housing',
        description: 'Special subsidy for toilet construction and basic rural housing amenities.',
        benefit_description: '₹15,000 sanitation grant.',
        required_documents: 'Panchayat Verification Letter',
        is_active: true,
      },
    ];

    const insertedSchemes = await Scheme.insertMany(schemeData);

    // 5. DYNAMIC SCHEME RULES
    // 1. Student Scholarship: annual_income <= 300000, education == STUDENT, age >= 16
    await SchemeRule.insertMany([
      { scheme_id: insertedSchemes[0]._id, rule_scope: 'FAMILY', field_name: 'annual_income', operator: '<=', value: '300000' },
      { scheme_id: insertedSchemes[0]._id, rule_scope: 'MEMBER', field_name: 'education', operator: '==', value: 'STUDENT' },
      { scheme_id: insertedSchemes[0]._id, rule_scope: 'MEMBER', field_name: 'age', operator: '>=', value: '16' },
    ]);

    // 2. Farmer Assistance: annual_income <= 250000, occupation == Farmer
    await SchemeRule.insertMany([
      { scheme_id: insertedSchemes[1]._id, rule_scope: 'FAMILY', field_name: 'annual_income', operator: '<=', value: '250000' },
      { scheme_id: insertedSchemes[1]._id, rule_scope: 'MEMBER', field_name: 'occupation', operator: '==', value: 'Farmer' },
    ]);

    // 3. Housing Assistance: annual_income <= 150000
    await SchemeRule.insertMany([
      { scheme_id: insertedSchemes[2]._id, rule_scope: 'FAMILY', field_name: 'annual_income', operator: '<=', value: '150000' },
    ]);

    // 4. Girl Child Education: annual_income <= 300000, gender == Female, education == STUDENT
    await SchemeRule.insertMany([
      { scheme_id: insertedSchemes[3]._id, rule_scope: 'FAMILY', field_name: 'annual_income', operator: '<=', value: '300000' },
      { scheme_id: insertedSchemes[3]._id, rule_scope: 'MEMBER', field_name: 'gender', operator: '==', value: 'Female' },
      { scheme_id: insertedSchemes[3]._id, rule_scope: 'MEMBER', field_name: 'education', operator: '==', value: 'STUDENT' },
    ]);

    // 5. Women Assistance: gender == Female, age >= 18
    await SchemeRule.insertMany([
      { scheme_id: insertedSchemes[4]._id, rule_scope: 'MEMBER', field_name: 'gender', operator: '==', value: 'Female' },
      { scheme_id: insertedSchemes[4]._id, rule_scope: 'MEMBER', field_name: 'age', operator: '>=', value: '18' },
    ]);

    // 6. Skill Development: age >= 18, age <= 35
    await SchemeRule.insertMany([
      { scheme_id: insertedSchemes[5]._id, rule_scope: 'MEMBER', field_name: 'age', operator: '>=', value: '18' },
      { scheme_id: insertedSchemes[5]._id, rule_scope: 'MEMBER', field_name: 'age', operator: '<=', value: '35' },
    ]);

    // 7. Senior Citizen Assistance: age >= 60
    await SchemeRule.insertMany([
      { scheme_id: insertedSchemes[6]._id, rule_scope: 'MEMBER', field_name: 'age', operator: '>=', value: '60' },
    ]);

    // 8. Agriculture Equipment: occupation == Farmer
    await SchemeRule.insertMany([
      { scheme_id: insertedSchemes[7]._id, rule_scope: 'MEMBER', field_name: 'occupation', operator: '==', value: 'Farmer' },
    ]);

    // 9. Education Support: annual_income <= 100000
    await SchemeRule.insertMany([
      { scheme_id: insertedSchemes[8]._id, rule_scope: 'FAMILY', field_name: 'annual_income', operator: '<=', value: '100000' },
    ]);

    // 10. Rural Housing: annual_income <= 120000
    await SchemeRule.insertMany([
      { scheme_id: insertedSchemes[9]._id, rule_scope: 'FAMILY', field_name: 'annual_income', operator: '<=', value: '120000' },
    ]);

    // 6. SAMPLE APPLICATIONS
    await Application.create({
      family_id: family1._id,
      scheme_id: insertedSchemes[1]._id, // Farmer Assistance
      applicant_person_id: rajesh._id,
      status: 'APPROVED',
      remarks: 'Land documents verified by Taluka Officer',
      submitted_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    });

    await Application.create({
      family_id: family1._id,
      scheme_id: insertedSchemes[0]._id, // Student Scholarship
      applicant_person_id: amit._id,
      status: 'SUBMITTED',
      remarks: 'Applied by citizen via ParivarSathi portal',
      submitted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    });

    await Application.create({
      family_id: family2._id,
      scheme_id: insertedSchemes[6]._id, // Senior Citizen Assistance
      applicant_person_id: kishore._id,
      status: 'UNDER_REVIEW',
      remarks: 'Age certificate under verification',
      submitted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    });

    console.log('MongoDB Seeded Successfully:');
    console.log(' - 1 Officer (officer@gujarat.gov.in / password123)');
    console.log(' - 2 Citizens (rajesh@gmail.com, priya@gmail.com / password123)');
    console.log(' - 2 Families with Unique IDs (GJ-FAM-7K3P9X2M, GJ-FAM-9A2B4C6D)');
    console.log(' - 10 Schemes with dynamic SchemeRules');
    console.log(' - 3 Demo Applications in various states');

    process.exit(0);
  } catch (err) {
    console.error('Error during seeding:', err);
    process.exit(1);
  }
};

importData();
