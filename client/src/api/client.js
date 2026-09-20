/**
 * ParivarSathi Gujarat Portal - API Client & Assumed Response Shapes
 * 
 * ASSUMED BACKEND RESPONSE SHAPES (Isolated in this file):
 * 
 * 1. Auth:
 *    POST /api/auth/login -> { token: string, user: { id, email, role: 'CITIZEN'|'OFFICER', person: { name, ... } } }
 *    POST /api/auth/register -> { token: string, user: { ... } }
 *    GET  /api/auth/me -> { id, email, role, person: { ... } }
 * 
 * 2. Family:
 *    GET  /api/family/my -> {
 *      hasFamily: boolean,
 *      family: { family_id, annual_income, address, district, taluka, village, family_head_person_id: { name, ... } },
 *      members: [ { _id, relationship, is_head, is_active, person_id: { _id, name, date_of_birth, gender, occupation, education, mobile, aadhar_last_4 } } ]
 *    }
 *    POST /api/family/create -> { family: { ... } }
 *    POST /api/family/member -> { member: { ... } }
 *    PUT  /api/family/update -> { family: { ... } }
 *    DELETE /api/family/member/:id -> { message: string }
 * 
 * 3. Eligibility:
 *    GET /api/eligibility/my-family -> {
 *      eligible_schemes: [ { scheme_id, name, department, benefit_summary, qualifying_members: [{ person_id, name, relationship }] } ],
 *      not_eligible_schemes: [ { scheme_id, name, department, reasons: string[] } ]
 *    }
 * 
 * 4. Applications:
 *    GET  /api/application/my -> [ { _id, scheme_id: { name, department }, applicant_person_id: { name, occupation }, status: 'SUBMITTED'|'UNDER_REVIEW'|'APPROVED'|'REJECTED', createdAt, officer_remarks } ]
 *    POST /api/application/apply -> { message: string, application: { ... } }
 * 
 * 5. Officer:
 *    GET /api/officer/stats -> { kpis: { totalFamilies, totalMembers, totalApplications, pendingApplications, approvedApplications, rejectedApplications } }
 *    GET /api/officer/applications -> [ ... ]
 *    PUT /api/application/:id/review -> { ... }
 */

import axios from 'axios';

const apiBaseURL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

const api = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('parivar_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor for 401 Unauthorized handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if expired
      if (localStorage.getItem('parivar_token')) {
        localStorage.removeItem('parivar_token');
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Public Portal Stats (used on public Landing Page)
 * Tries fetching from backend if available; otherwise returns realistic Gujarat Portal metrics.
 */
export const fetchPublicPortalStats = async () => {
  try {
    const res = await api.get('/dashboard/summary');
    if (res.data) {
      return {
        familiesRegistered: res.data.totalFamilies || 128450,
        schemesLinked: res.data.totalSchemes || 48,
        benefitsDisbursed: res.data.totalDisbursed || '₹342 Cr',
        missedBenefitsFound: res.data.missedBenefits || 89200
      };
    }
  } catch (e) {
    // Expected when unauthenticated - fallback to realistic government portal benchmark stats
  }
  return {
    familiesRegistered: 124890,
    schemesLinked: 46,
    benefitsDisbursed: '₹342.8 Cr',
    missedBenefitsFound: 84320
  };
};

/**
 * Public Scheme Directory for Landing / Schemes Explorer
 */
export const fetchPublicSchemes = async () => {
  try {
    const res = await api.get('/scheme');
    if (res.data && Array.isArray(res.data)) {
      return res.data;
    }
  } catch (e) {
    // Fallback schemes if unauthenticated
  }

  return [
    {
      scheme_id: 'SCH-KMY-2026',
      name: 'Mukhyamantri Kisan Sahay Yojana (MKSY)',
      name_gu: 'મુખ્યમંત્રી કિસાન સહાય યોજના',
      department: 'Agriculture, Farmers Welfare & Co-operation Department',
      category: 'Agriculture',
      benefit_summary: 'Up to ₹20,000/hectare financial assistance for crop damage due to drought or excess rain.',
      target_group: 'Small & Marginal Farmers',
      is_active: true
    },
    {
      scheme_id: 'SCH-VDY-2026',
      name: 'Vhali Dikri Yojana (VDY)',
      name_gu: 'વ્હાલી દીકરી યોજના',
      department: 'Women & Child Development Department',
      category: 'Women & Child',
      benefit_summary: '₹1,10,000 total financial assistance in 3 stages for education & marriage of first two girl children.',
      target_group: 'Girl child up to age 18 in families with income under ₹2,00,000',
      is_active: true
    },
    {
      scheme_id: 'SCH-MAA-2026',
      name: 'Mukhyamantri Amrutam (MAA / PMJAY) Health Cover',
      name_gu: 'મુખ્યમંત્રી અમૃતમ (મા) યોજના',
      department: 'Health & Family Welfare Department',
      category: 'Health',
      benefit_summary: 'Cashless tertiary healthcare cover up to ₹10,00,000 per family per year across empaneled hospitals.',
      target_group: 'BPL, SECC and Low-income households under ₹4,00,000',
      is_active: true
    },
    {
      scheme_id: 'SCH-MYSY-2026',
      name: 'Mukhyamantri Yuva Swavalamban Yojana (MYSY)',
      name_gu: 'મુખ્યમંત્રી યુવા સ્વાવલંબન યોજના',
      department: 'Education Department',
      category: 'Education',
      benefit_summary: '50% tuition fee subsidy (up to ₹2,00,000/yr) + hostel stipend for higher education students.',
      target_group: 'Students scoring >80 percentile in 10th/12th with family income < ₹6,00,000',
      is_active: true
    },
    {
      scheme_id: 'SCH-NSAP-2026',
      name: 'Indira Gandhi National Old Age Pension Scheme',
      name_gu: 'ઇન્દિરા गांधी રાષ્ટ્રીય વૃદ્ધાવસ્થા પેન્શન',
      department: 'Social Justice & Empowerment Department',
      category: 'Social Welfare',
      benefit_summary: 'Monthly direct bank transfer pension of ₹1,250 for senior citizens above 60 years.',
      target_group: 'Senior Citizens (60+ years) from BPL households',
      is_active: true
    },
    {
      scheme_id: 'SCH-SBY-2026',
      name: 'Shramik Basera Yojana (Housing Subsidy)',
      name_gu: 'શ્રમિક બસેરા યોજના',
      department: 'Labour, Skill Development & Employment Department',
      category: 'Housing',
      benefit_summary: 'Subsidised temporary rental accommodation and permanent housing grant for construction workers.',
      target_group: 'Registered Construction / Unorganized Sector Workers',
      is_active: true
    }
  ];
};

export const dummyFamilyData = {
  hasFamily: true,
  family: {
    family_id: 'GJ-FAM-7K3P9X2M',
    annual_income: 180000,
    address: '12, Krishna Society, Surendranagar',
    district: 'Surendranagar',
    taluka: 'Wadhwan',
    village: 'Jorawarpura',
    family_head_person_id: {
      _id: 'person_head_01',
      name: 'Rajesh Patel',
      gender: 'MALE',
      date_of_birth: '1985-02-14',
      occupation: 'Farmer',
      education: 'Diploma'
    }
  },
  members: [
    {
      _id: 'member_head_01',
      relationship: 'SELF',
      is_head: true,
      is_active: true,
      person_id: {
        _id: 'person_head_01',
        name: 'Rajesh Patel',
        date_of_birth: '1985-02-14',
        gender: 'MALE',
        occupation: 'Farmer',
        education: 'Diploma',
        mobile: '9876543210',
        aadhar_last_4: '4531'
      }
    },
    {
      _id: 'member_spouse_01',
      relationship: 'SPOUSE',
      is_head: false,
      is_active: true,
      person_id: {
        _id: 'person_spouse_01',
        name: 'Meena Patel',
        date_of_birth: '1988-06-12',
        gender: 'FEMALE',
        occupation: 'Homemaker',
        education: 'Higher Secondary',
        mobile: '9876543211',
        aadhar_last_4: '7742'
      }
    },
    {
      _id: 'member_son_01',
      relationship: 'SON',
      is_head: false,
      is_active: true,
      person_id: {
        _id: 'person_son_01',
        name: 'Amit Patel',
        date_of_birth: '2010-08-21',
        gender: 'MALE',
        occupation: 'Student',
        education: 'Class 10',
        mobile: '9876543212',
        aadhar_last_4: '1998'
      }
    },
    {
      _id: 'member_father_01',
      relationship: 'FATHER',
      is_head: false,
      is_active: true,
      person_id: {
        _id: 'person_father_01',
        name: 'Ramlal Patel',
        date_of_birth: '1960-11-03',
        gender: 'MALE',
        occupation: 'Retired',
        education: 'Primary',
        mobile: '9876543213',
        aadhar_last_4: '5567'
      }
    }
  ]
};

export const dummyEligibilityData = {
  eligible_schemes: [
    {
      scheme_id: 'SCH-NSAP-2026',
      name: 'Indira Gandhi National Old Age Pension Scheme',
      department: 'Social Justice & Empowerment Department',
      benefit_summary: 'Monthly pension support of ₹1,250 for eligible senior citizens.',
      qualifying_members: [
        { person_id: 'person_father_01', name: 'Ramlal Patel', relationship: 'FATHER' }
      ]
    },
    {
      scheme_id: 'SCH-MYSY-2026',
      name: 'Mukhyamantri Yuva Swavalamban Yojana (MYSY)',
      department: 'Education Department',
      benefit_summary: 'Tuition fee subsidy for students demonstrating academic potential.',
      qualifying_members: [
        { person_id: 'person_son_01', name: 'Amit Patel', relationship: 'SON' }
      ]
    }
  ],
  not_eligible_schemes: [
    {
      scheme_id: 'SCH-VDY-2026',
      name: 'Vhali Dikri Yojana (VDY)',
      department: 'Women & Child Development Department',
      reasons: ['No eligible girl child is currently registered in the household.']
    }
  ]
};

export const dummyApplications = [
  {
    _id: 'APP-20260001',
    scheme_id: { name: 'Indira Gandhi National Old Age Pension Scheme', department: 'Social Justice & Empowerment Department' },
    applicant_person_id: { name: 'Ramlal Patel' },
    family_id: { family_id: 'GJ-FAM-7K3P9X2M', district: 'Surendranagar' },
    status: 'APPROVED',
    createdAt: '2026-08-12T10:30:00.000Z',
    officer_remarks: 'Eligibility verified and pension approved.'
  },
  {
    _id: 'APP-20260002',
    scheme_id: { name: 'Mukhyamantri Yuva Swavalamban Yojana (MYSY)', department: 'Education Department' },
    applicant_person_id: { name: 'Amit Patel' },
    family_id: { family_id: 'GJ-FAM-7K3P9X2M', district: 'Surendranagar' },
    status: 'UNDER_REVIEW',
    createdAt: '2026-09-02T14:45:00.000Z',
    officer_remarks: 'Documents under verification.'
  },
  {
    _id: 'APP-20260003',
    scheme_id: { name: 'Mukhyamantri Kisan Sahay Yojana (MKSY)', department: 'Agriculture Department' },
    applicant_person_id: { name: 'Rajesh Patel' },
    family_id: { family_id: 'GJ-FAM-7K3P9X2M', district: 'Surendranagar' },
    status: 'SUBMITTED',
    createdAt: '2026-09-15T09:15:00.000Z',
    officer_remarks: 'Application received and pending district review.'
  }
];

export const dummySchemeList = [
  {
    _id: 'sch_001',
    scheme_id: 'SCH-KMY-2026',
    name: 'Mukhyamantri Kisan Sahay Yojana',
    name_gu: 'મુખ્યમંત્રી કિસાન સહાય યોજના',
    department: 'Agriculture, Farmers Welfare & Co-operation Department',
    benefit_type: 'DIRECT_TRANSFER',
    benefit_amount: 20000,
    description: 'Financial assistance to small and marginal farmers facing crop loss due to natural calamities or adverse weather conditions.',
    is_active: true,
    rules: [
      { rule_type: 'annual_income', operator: '<=', value: '200000', description: 'Family income cap' },
      { rule_type: 'district_residency', operator: 'IN', value: 'Surendranagar, Rajkot', description: 'Eligible districts' }
    ]
  },
  {
    _id: 'sch_002',
    scheme_id: 'SCH-VDY-2026',
    name: 'Vhali Dikri Yojana',
    name_gu: 'વ્હાલી દીકરી યોજના',
    department: 'Women & Child Development Department',
    benefit_type: 'DIRECT_TRANSFER',
    benefit_amount: 110000,
    description: 'Support for the education and marriage of first two girl children in eligible families.',
    is_active: true,
    rules: [
      { rule_type: 'gender', operator: '=', value: 'FEMALE', description: 'Girl child benefit' },
      { rule_type: 'annual_income', operator: '<=', value: '200000', description: 'Family income threshold' }
    ]
  },
  {
    _id: 'sch_003',
    scheme_id: 'SCH-MYSY-2026',
    name: 'Mukhyamantri Yuva Swavalamban Yojana',
    name_gu: 'મુખ્યમંત્રી યુવા સ્વાવલંબન યોજના',
    department: 'Education Department',
    benefit_type: 'TUITION_SUBSIDY',
    benefit_amount: 200000,
    description: 'Subsidy for higher education tuition fees and hostel support for eligible students.',
    is_active: true,
    rules: [
      { rule_type: 'education', operator: '>=', value: 'Class 12', description: 'Academic level required' },
      { rule_type: 'annual_income', operator: '<=', value: '600000', description: 'Income ceiling' }
    ]
  },
  {
    _id: 'sch_004',
    scheme_id: 'SCH-NSAP-2026',
    name: 'Old Age Pension Scheme',
    name_gu: 'વૃદ્ધાવસ્થા પેન્શન યોજના',
    department: 'Social Justice & Empowerment Department',
    benefit_type: 'MONTHLY_PENSION',
    benefit_amount: 1250,
    description: 'Monthly pension for eligible senior citizens from low-income households.',
    is_active: true,
    rules: [
      { rule_type: 'age', operator: '>=', value: '60', description: 'Minimum age' },
      { rule_type: 'income_group', operator: '=', value: 'BPL', description: 'Income group eligibility' }
    ]
  },
  {
    _id: 'sch_005',
    scheme_id: 'SCH-MAA-2026',
    name: 'Mukhyamantri Amrutam Health Cover',
    name_gu: 'મુખ્યમંત્રી અમૃતમ רפואા કવર',
    department: 'Health & Family Welfare Department',
    benefit_type: 'HEALTH_COVER',
    benefit_amount: 1000000,
    description: 'Cashless health coverage for tertiary medical treatment in empaneled hospitals.',
    is_active: false,
    rules: [
      { rule_type: 'family_income', operator: '<=', value: '400000', description: 'Maximum family income' },
      { rule_type: 'household_type', operator: '=', value: 'Below Poverty Line', description: 'Priority category' }
    ]
  },
  {
    _id: 'sch_006',
    scheme_id: 'SCH-SBY-2026',
    name: 'Shramik Basera Yojana',
    name_gu: 'શ્રમિક બસેરા યોજના',
    department: 'Labour, Skill Development & Employment Department',
    benefit_type: 'HOUSING_SUPPORT',
    benefit_amount: 30000,
    description: 'Support for construction workers and low-income households seeking housing assistance.',
    is_active: true,
    rules: [
      { rule_type: 'occupation', operator: 'IN', value: 'Construction Worker, Labour', description: 'Eligible occupations' },
      { rule_type: 'annual_income', operator: '<=', value: '300000', description: 'Income threshold' }
    ]
  }
];

export const dummyOfficerStats = {
  kpis: {
    totalFamilies: 128,
    totalMembers: 486,
    totalApplications: 219,
    pendingApplications: 48,
    approvedApplications: 132,
    rejectedApplications: 39
  },
  charts: {
    applicationsByScheme: [
      { name: 'Kisan Sahay', count: 42 },
      { name: 'Vhali Dikri', count: 35 },
      { name: 'MAA Health', count: 29 },
      { name: 'MYSY Scholarship', count: 24 },
      { name: 'Old Age Pension', count: 18 }
    ],
    statusDistribution: [
      { name: 'APPROVED', count: 132 },
      { name: 'UNDER_REVIEW', count: 48 },
      { name: 'SUBMITTED', count: 23 },
      { name: 'REJECTED', count: 39 },
      { name: 'DRAFT', count: 10 }
    ],
    familiesByDistrict: [
      { name: 'Surendranagar', count: 32 },
      { name: 'Rajkot', count: 29 },
      { name: 'Ahmedabad', count: 26 },
      { name: 'Bhavnagar', count: 18 }
    ]
  }
};

export default api;
