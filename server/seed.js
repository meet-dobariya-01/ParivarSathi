/**
 * ParivarSathi — Realistic Gujarat Seed Script
 * Wipes all collections and populates with authentic Gujarat government demo data.
 * Run: node seed.js
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const bcrypt    = require('bcryptjs');
const crypto    = require('crypto');

const User             = require('./models/User');
const Person           = require('./models/Person');
const Family           = require('./models/Family');
const FamilyMembership = require('./models/FamilyMembership');
const Scheme           = require('./models/Scheme');
const SchemeRule       = require('./models/SchemeRule');
const Application      = require('./models/Application');

/* ─── helpers ─────────────────────────────────────────────────────────── */
const generateFamilyId = () => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let id = '';
  const bytes = crypto.randomBytes(8);
  for (let i = 0; i < 8; i++) id += chars[bytes[i] % chars.length];
  return `GJ-FAM-${id}`;
};

const daysAgo = (n) => new Date(Date.now() - n * 864e5);
const dob     = (y, m, d) => new Date(`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`);

/* ─── main ─────────────────────────────────────────────────────────────── */
const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('\n🔗 Connected to MongoDB.');
  console.log('🗑️  Clearing existing collections...\n');

  await User.deleteMany({});
  await Person.deleteMany({});
  await Family.deleteMany({});
  await FamilyMembership.deleteMany({});
  await Scheme.deleteMany({});
  await SchemeRule.deleteMany({});
  await Application.deleteMany({});

  const PASSWORD_HASH = await bcrypt.hash('Test@123', 10);

  /* ══════════════════════════════════════════════════════
     1. OFFICER
  ══════════════════════════════════════════════════════ */
  const officerPerson = await Person.create({
    name: 'Rameshbhai Chauhan',
    date_of_birth: dob(1978, 6, 15),
    gender: 'Male',
    mobile: '9825001234',
    occupation: 'GOVERNMENT_JOB',
    education: 'POST_GRADUATE',
  });
  await User.create({
    email: 'officer@gujarat.gov.in',
    password_hash: PASSWORD_HASH,
    role: 'OFFICER',
    person_id: officerPerson._id,
    is_active: true,
  });

  /* ══════════════════════════════════════════════════════
     2. PERSONS (all 45)
  ══════════════════════════════════════════════════════ */

  // F01 — Surendranagar/Chotila/Kherali — ₹1,80,000 — Farmer family
  const p_rajesh   = await Person.create({ name:'Rajesh Patel',    date_of_birth:dob(1988,4,10), gender:'Male',   mobile:'9879001001', occupation:'FARMER',      education:'SSC'          });
  const p_nita     = await Person.create({ name:'Nita Patel',      date_of_birth:dob(1991,7,22), gender:'Female', mobile:'9879001002', occupation:'HOMEMAKER',   education:'SSC'          });
  const p_aarav    = await Person.create({ name:'Aarav Patel',     date_of_birth:dob(2007,3,5),  gender:'Male',   mobile:'8140001003', occupation:'STUDENT',     education:'STUDENT'      });
  const p_diya     = await Person.create({ name:'Diya Patel',      date_of_birth:dob(2012,9,14), gender:'Female', mobile:'8140001004', occupation:'STUDENT',     education:'STUDENT'      });

  // F02 — Surendranagar/Limbdi/Bhojpara — ₹2,40,000 — Farmer + elderly mother
  const p_bhavesh  = await Person.create({ name:'Bhavesh Vaghela', date_of_birth:dob(1982,11,3), gender:'Male',   mobile:'9825002001', occupation:'FARMER',      education:'SSC'          });
  const p_bhavna   = await Person.create({ name:'Bhavna Vaghela',  date_of_birth:dob(1986,5,18), gender:'Female', mobile:'9825002002', occupation:'HOMEMAKER',   education:'ILLITERATE'   });
  const p_jashiben = await Person.create({ name:'Jashiben Vaghela',date_of_birth:dob(1955,2,28), gender:'Female', mobile:'9825002003', occupation:'RETIRED',     education:'ILLITERATE'   });
  const p_vivaan   = await Person.create({ name:'Vivaan Vaghela',  date_of_birth:dob(2005,8,20), gender:'Male',   mobile:'8141002004', occupation:'STUDENT',     education:'HSC'          });

  // F03 — Rajkot/Gondal/Mavdi — ₹2,40,000 — Women-headed (Meena Shah)
  const p_meena    = await Person.create({ name:'Meena Shah',      date_of_birth:dob(1986,3,25), gender:'Female', mobile:'9879003001', occupation:'HOMEMAKER',   education:'HSC'          });
  const p_amit     = await Person.create({ name:'Amit Shah',       date_of_birth:dob(1983,12,10),gender:'Male',   mobile:'9879003002', occupation:'PRIVATE_JOB', education:'GRADUATE'     });
  const p_anaya    = await Person.create({ name:'Anaya Shah',      date_of_birth:dob(2012,6,7),  gender:'Female', mobile:'8141003003', occupation:'STUDENT',     education:'STUDENT'      });
  const p_krish    = await Person.create({ name:'Krish Shah',      date_of_birth:dob(2015,1,30), gender:'Male',   mobile:'8141003004', occupation:'STUDENT',     education:'STUDENT'      });

  // F04 — Rajkot/Jetpur/Navagam — ₹2,80,000 — Farmer + daughter student
  const p_jagdish  = await Person.create({ name:'Jagdish Parmar',  date_of_birth:dob(1980,8,12), gender:'Male',   mobile:'9825004001', occupation:'FARMER',      education:'SSC'          });
  const p_hansaben = await Person.create({ name:'Hansaben Parmar', date_of_birth:dob(1984,4,2),  gender:'Female', mobile:'9825004002', occupation:'HOMEMAKER',   education:'ILLITERATE'   });
  const p_priya    = await Person.create({ name:'Priya Parmar',    date_of_birth:dob(2008,2,14), gender:'Female', mobile:'8142004003', occupation:'STUDENT',     education:'STUDENT'      });

  // F05 — Ahmedabad/Sanand/Telav — ₹6,00,000 — Urban middle-class
  const p_kiran    = await Person.create({ name:'Kiran Desai',     date_of_birth:dob(1984,7,19), gender:'Male',   mobile:'9879005001', occupation:'PRIVATE_JOB', education:'GRADUATE'     });
  const p_priyanka = await Person.create({ name:'Priyanka Desai',  date_of_birth:dob(1988,11,5), gender:'Female', mobile:'9879005002', occupation:'PRIVATE_JOB', education:'GRADUATE'     });
  const p_aditya   = await Person.create({ name:'Aditya Desai',    date_of_birth:dob(2004,3,22), gender:'Male',   mobile:'8140005003', occupation:'STUDENT',     education:'GRADUATE'     });
  const p_riya     = await Person.create({ name:'Riya Desai',      date_of_birth:dob(2006,9,8),  gender:'Female', mobile:'8140005004', occupation:'STUDENT',     education:'HSC'          });

  // F06 — Ahmedabad/Daskroi/Bopal — ₹3,00,000 — Private job, student son
  const p_dinesh   = await Person.create({ name:'Dinesh Chaudhary',date_of_birth:dob(1986,5,30), gender:'Male',   mobile:'9825006001', occupation:'PRIVATE_JOB', education:'GRADUATE'     });
  const p_kirti    = await Person.create({ name:'Kirti Chaudhary', date_of_birth:dob(1989,10,14),gender:'Female', mobile:'9825006002', occupation:'HOMEMAKER',   education:'HSC'          });
  const p_rohan    = await Person.create({ name:'Rohan Chaudhary', date_of_birth:dob(2007,7,3),  gender:'Male',   mobile:'8142006003', occupation:'STUDENT',     education:'STUDENT'      });
  const p_nidhi    = await Person.create({ name:'Nidhi Chaudhary', date_of_birth:dob(2010,4,18), gender:'Female', mobile:'8142006004', occupation:'STUDENT',     education:'STUDENT'      });

  // F07 — Bhavnagar/Sihor/Palitana Road — ₹2,20,000 — Farmer family (Hiren Rabari)
  const p_hiren    = await Person.create({ name:'Hiren Rabari',    date_of_birth:dob(1986,9,8),  gender:'Male',   mobile:'9879007001', occupation:'FARMER',      education:'SSC'          });
  const p_sunita   = await Person.create({ name:'Sunita Rabari',   date_of_birth:dob(1990,1,25), gender:'Female', mobile:'9879007002', occupation:'HOMEMAKER',   education:'ILLITERATE'   });
  const p_dev      = await Person.create({ name:'Dev Rabari',      date_of_birth:dob(2008,6,11), gender:'Male',   mobile:'8143007003', occupation:'STUDENT',     education:'STUDENT'      });

  // F08 — Bhavnagar/Vallabhipur/Chamardi — ₹2,00,000 — Farmer + elderly parents
  const p_kokilaben= await Person.create({ name:'Kokilaben Patel', date_of_birth:dob(1979,12,20),gender:'Female', mobile:'9825008001', occupation:'FARMER',      education:'SSC'          });
  const p_amrut    = await Person.create({ name:'Amrutbhai Patel', date_of_birth:dob(1952,4,5),  gender:'Male',   mobile:'9825008002', occupation:'RETIRED',     education:'ILLITERATE'   });
  const p_santok   = await Person.create({ name:'Santokben Patel', date_of_birth:dob(1956,8,15), gender:'Female', mobile:'9825008003', occupation:'RETIRED',     education:'ILLITERATE'   });

  // F09 — Vadodara/Padra/Sevasi — ₹5,00,000 — Govt job family (Nisha Solanki)
  const p_nisha    = await Person.create({ name:'Nisha Solanki',   date_of_birth:dob(1988,2,14), gender:'Female', mobile:'9879009001', occupation:'GOVERNMENT_JOB',education:'POST_GRADUATE'});
  const p_jignesh  = await Person.create({ name:'Jignesh Solanki', date_of_birth:dob(1985,6,30), gender:'Male',   mobile:'9879009002', occupation:'GOVERNMENT_JOB',education:'GRADUATE'    });
  const p_kavya    = await Person.create({ name:'Kavya Solanki',   date_of_birth:dob(2010,11,3), gender:'Female', mobile:'8141009003', occupation:'STUDENT',     education:'STUDENT'      });
  const p_isha     = await Person.create({ name:'Isha Solanki',    date_of_birth:dob(2014,4,17), gender:'Female', mobile:'8141009004', occupation:'STUDENT',     education:'STUDENT'      });

  // F10 — Vadodara/Savli/Ajwa — ₹3,50,000 — Senior citizen couple
  const p_rekhaben = await Person.create({ name:'Rekhaben Joshi',  date_of_birth:dob(1962,7,10), gender:'Female', mobile:'9879010001', occupation:'RETIRED',     education:'GRADUATE'     });
  const p_sanjay   = await Person.create({ name:'Sanjay Joshi',    date_of_birth:dob(1959,3,22), gender:'Male',   mobile:'9879010002', occupation:'RETIRED',     education:'GRADUATE'     });
  const p_harsh    = await Person.create({ name:'Harsh Joshi',     date_of_birth:dob(1992,8,5),  gender:'Male',   mobile:'8141010003', occupation:'PRIVATE_JOB', education:'GRADUATE'     });

  // F11 — Surat/Olpad/Kim — ₹5,50,000 — Business family
  const p_mahesh   = await Person.create({ name:'Mahesh Patel',    date_of_birth:dob(1979,5,12), gender:'Male',   mobile:'9825011001', occupation:'BUSINESS',    education:'GRADUATE'     });
  const p_komal    = await Person.create({ name:'Komal Patel',     date_of_birth:dob(1983,9,28), gender:'Female', mobile:'9825011002', occupation:'HOMEMAKER',   education:'HSC'          });
  const p_yash     = await Person.create({ name:'Yash Patel',      date_of_birth:dob(2004,2,16), gender:'Male',   mobile:'8144011003', occupation:'STUDENT',     education:'GRADUATE'     });

  // F12 — Junagadh/Keshod/Mesvan — ₹1,50,000 — Very low income labour family
  const p_viththal = await Person.create({ name:'Viththalbhai Mer',date_of_birth:dob(1984,10,8), gender:'Male',   mobile:'9825012001', occupation:'LABOUR',      education:'ILLITERATE'   });
  const p_jiviben  = await Person.create({ name:'Jiviben Mer',     date_of_birth:dob(1988,3,15), gender:'Female', mobile:'9825012002', occupation:'HOMEMAKER',   education:'ILLITERATE'   });
  const p_devmer   = await Person.create({ name:'Dev Mer',         date_of_birth:dob(2010,7,22), gender:'Male',   mobile:'8145012003', occupation:'STUDENT',     education:'STUDENT'      });
  const p_krisha   = await Person.create({ name:'Krisha Mer',      date_of_birth:dob(2014,1,9),  gender:'Female', mobile:'8145012004', occupation:'STUDENT',     education:'STUDENT'      });
  const p_harshmer = await Person.create({ name:'Harsh Mer',       date_of_birth:dob(2016,5,30), gender:'Male',   mobile:'8145012005', occupation:'STUDENT',     education:'STUDENT'      });

  console.log(`✔  Created ${await Person.countDocuments()} persons`);

  /* ══════════════════════════════════════════════════════
     3. CITIZEN USERS (5)
  ══════════════════════════════════════════════════════ */
  await User.create([
    { email:'rajesh.patel@gmail.com',  password_hash:PASSWORD_HASH, role:'CITIZEN', person_id:p_rajesh._id,   is_active:true },
    { email:'meena.shah@gmail.com',    password_hash:PASSWORD_HASH, role:'CITIZEN', person_id:p_meena._id,    is_active:true },
    { email:'kiran.desai@gmail.com',   password_hash:PASSWORD_HASH, role:'CITIZEN', person_id:p_kiran._id,    is_active:true },
    { email:'hiren.rabari@gmail.com',  password_hash:PASSWORD_HASH, role:'CITIZEN', person_id:p_hiren._id,    is_active:true },
    { email:'nisha.solanki@gmail.com', password_hash:PASSWORD_HASH, role:'CITIZEN', person_id:p_nisha._id,    is_active:true },
  ]);
  console.log(`✔  Created 6 users (1 officer + 5 citizens)`);

  /* ══════════════════════════════════════════════════════
     4. FAMILIES (12) + MEMBERSHIPS
  ══════════════════════════════════════════════════════ */
  const mkAddr = (village) => `House No. 12, Patel Faliyu, Near Primary School, ${village}`;

  const f01 = await Family.create({ family_id:generateFamilyId(), family_head_person_id:p_rajesh._id,   annual_income:180000, address:mkAddr('Kherali'),       district:'Surendranagar', taluka:'Chotila',     village:'Kherali'       });
  const f02 = await Family.create({ family_id:generateFamilyId(), family_head_person_id:p_bhavesh._id,  annual_income:240000, address:mkAddr('Bhojpara'),      district:'Surendranagar', taluka:'Limbdi',      village:'Bhojpara'      });
  const f03 = await Family.create({ family_id:generateFamilyId(), family_head_person_id:p_meena._id,    annual_income:240000, address:mkAddr('Mavdi'),         district:'Rajkot',        taluka:'Gondal',      village:'Mavdi'         });
  const f04 = await Family.create({ family_id:generateFamilyId(), family_head_person_id:p_jagdish._id,  annual_income:280000, address:mkAddr('Navagam'),       district:'Rajkot',        taluka:'Jetpur',      village:'Navagam'       });
  const f05 = await Family.create({ family_id:generateFamilyId(), family_head_person_id:p_kiran._id,    annual_income:600000, address:mkAddr('Telav'),         district:'Ahmedabad',     taluka:'Sanand',      village:'Telav'         });
  const f06 = await Family.create({ family_id:generateFamilyId(), family_head_person_id:p_dinesh._id,   annual_income:300000, address:mkAddr('Bopal'),         district:'Ahmedabad',     taluka:'Daskroi',     village:'Bopal'         });
  const f07 = await Family.create({ family_id:generateFamilyId(), family_head_person_id:p_hiren._id,    annual_income:220000, address:mkAddr('Palitana Road'), district:'Bhavnagar',     taluka:'Sihor',       village:'Palitana Road' });
  const f08 = await Family.create({ family_id:generateFamilyId(), family_head_person_id:p_kokilaben._id,annual_income:200000, address:mkAddr('Chamardi'),      district:'Bhavnagar',     taluka:'Vallabhipur', village:'Chamardi'      });
  const f09 = await Family.create({ family_id:generateFamilyId(), family_head_person_id:p_nisha._id,    annual_income:500000, address:mkAddr('Sevasi'),        district:'Vadodara',      taluka:'Padra',       village:'Sevasi'        });
  const f10 = await Family.create({ family_id:generateFamilyId(), family_head_person_id:p_rekhaben._id, annual_income:350000, address:mkAddr('Ajwa'),          district:'Vadodara',      taluka:'Savli',       village:'Ajwa'          });
  const f11 = await Family.create({ family_id:generateFamilyId(), family_head_person_id:p_mahesh._id,   annual_income:550000, address:mkAddr('Kim'),           district:'Surat',         taluka:'Olpad',       village:'Kim'           });
  const f12 = await Family.create({ family_id:generateFamilyId(), family_head_person_id:p_viththal._id, annual_income:150000, address:mkAddr('Mesvan'),        district:'Junagadh',      taluka:'Keshod',      village:'Mesvan'        });

  // Memberships
  const ms = (fid, pid, rel, isHead) => ({ family_id:fid, person_id:pid, relationship:rel, is_head:!!isHead, status:'ACTIVE', joined_at:new Date() });

  await FamilyMembership.insertMany([
    // F01
    ms(f01._id, p_rajesh._id,    'HEAD',     true),
    ms(f01._id, p_nita._id,      'SPOUSE',   false),
    ms(f01._id, p_aarav._id,     'SON',      false),
    ms(f01._id, p_diya._id,      'DAUGHTER', false),
    // F02
    ms(f02._id, p_bhavesh._id,   'HEAD',     true),
    ms(f02._id, p_bhavna._id,    'SPOUSE',   false),
    ms(f02._id, p_jashiben._id,  'MOTHER',   false),
    ms(f02._id, p_vivaan._id,    'SON',      false),
    // F03
    ms(f03._id, p_meena._id,     'HEAD',     true),
    ms(f03._id, p_amit._id,      'SPOUSE',   false),
    ms(f03._id, p_anaya._id,     'DAUGHTER', false),
    ms(f03._id, p_krish._id,     'SON',      false),
    // F04
    ms(f04._id, p_jagdish._id,   'HEAD',     true),
    ms(f04._id, p_hansaben._id,  'SPOUSE',   false),
    ms(f04._id, p_priya._id,     'DAUGHTER', false),
    // F05
    ms(f05._id, p_kiran._id,     'HEAD',     true),
    ms(f05._id, p_priyanka._id,  'SPOUSE',   false),
    ms(f05._id, p_aditya._id,    'SON',      false),
    ms(f05._id, p_riya._id,      'DAUGHTER', false),
    // F06
    ms(f06._id, p_dinesh._id,    'HEAD',     true),
    ms(f06._id, p_kirti._id,     'SPOUSE',   false),
    ms(f06._id, p_rohan._id,     'SON',      false),
    ms(f06._id, p_nidhi._id,     'DAUGHTER', false),
    // F07
    ms(f07._id, p_hiren._id,     'HEAD',     true),
    ms(f07._id, p_sunita._id,    'SPOUSE',   false),
    ms(f07._id, p_dev._id,       'SON',      false),
    // F08
    ms(f08._id, p_kokilaben._id, 'HEAD',     true),
    ms(f08._id, p_amrut._id,     'FATHER',   false),
    ms(f08._id, p_santok._id,    'MOTHER',   false),
    // F09
    ms(f09._id, p_nisha._id,     'HEAD',     true),
    ms(f09._id, p_jignesh._id,   'SPOUSE',   false),
    ms(f09._id, p_kavya._id,     'DAUGHTER', false),
    ms(f09._id, p_isha._id,      'DAUGHTER', false),
    // F10
    ms(f10._id, p_rekhaben._id,  'HEAD',     true),
    ms(f10._id, p_sanjay._id,    'SPOUSE',   false),
    ms(f10._id, p_harsh._id,     'SON',      false),
    // F11
    ms(f11._id, p_mahesh._id,    'HEAD',     true),
    ms(f11._id, p_komal._id,     'SPOUSE',   false),
    ms(f11._id, p_yash._id,      'SON',      false),
    // F12
    ms(f12._id, p_viththal._id,  'HEAD',     true),
    ms(f12._id, p_jiviben._id,   'SPOUSE',   false),
    ms(f12._id, p_devmer._id,    'SON',      false),
    ms(f12._id, p_krisha._id,    'DAUGHTER', false),
    ms(f12._id, p_harshmer._id,  'SON',      false),
  ]);
  console.log(`✔  Created 12 families + ${await FamilyMembership.countDocuments()} memberships`);

  /* ══════════════════════════════════════════════════════
     5. SCHEMES + RULES (10)
  ══════════════════════════════════════════════════════ */
  const schemeData = [
    {
      name: 'Student Scholarship',
      department: 'Education Department',
      description: '[DEMO DATA] Financial assistance for students from low-income families in Gujarat. Covers tuition, books and exam fees.',
      benefit_description: '₹15,000/year scholarship for students from low-income families',
      required_documents: 'Income Certificate, School/College ID, Bank Passbook, Aadhaar (not stored)',
      is_active: true,
    },
    {
      name: 'Farmer Assistance',
      department: 'Agriculture & Cooperation Department',
      description: '[DEMO DATA] Direct benefit transfer to small and marginal farmers for seeds, fertilizers and crop insurance.',
      benefit_description: '₹6,000/year direct benefit transfer to small farmers',
      required_documents: 'Land Record (7/12), Bank Passbook, Farmer ID',
      is_active: true,
    },
    {
      name: 'Housing Assistance',
      department: 'Rural Development Department',
      description: '[DEMO DATA] Financial aid for pucca house construction for low-income rural households under PMAY-Gramin.',
      benefit_description: 'Financial assistance up to ₹1,20,000 for pucca house construction',
      required_documents: 'Income Certificate, Land Documents, Ration Card',
      is_active: true,
    },
    {
      name: 'Girl Child Education Assistance',
      department: 'Women & Child Development',
      description: '[DEMO DATA] Encouragement grant (Kanya Kelavani) to keep girl students enrolled in school through class 12.',
      benefit_description: '₹10,000/year for girl students up to class 12',
      required_documents: 'Birth Certificate, School Certificate, Income Certificate',
      is_active: true,
    },
    {
      name: 'Women Assistance',
      department: 'Women & Child Development',
      description: '[DEMO DATA] Livelihood support and social security for women from BPL families.',
      benefit_description: '₹5,000/year livelihood support to women from BPL families',
      required_documents: 'Income Certificate, Ration Card, Bank Passbook',
      is_active: true,
    },
    {
      name: 'Skill Development Assistance',
      department: 'Labour & Employment Department',
      description: '[DEMO DATA] Free vocational training at ITI centres with monthly training allowance for youth.',
      benefit_description: 'Free vocational training + ₹3,000 stipend',
      required_documents: 'Age Proof, Education Certificate, Bank Passbook',
      is_active: true,
    },
    {
      name: 'Senior Citizen Assistance',
      department: 'Social Justice & Empowerment',
      description: '[DEMO DATA] Monthly old age pension for citizens aged 60 and above under the Vrudh Sahay Yojana.',
      benefit_description: '₹1,500/month pension for citizens above 60',
      required_documents: 'Age Proof, Income Certificate, Bank Passbook',
      is_active: true,
    },
    {
      name: 'Agriculture Equipment Assistance',
      department: 'Agriculture Department',
      description: '[DEMO DATA] Capital subsidy on purchase of mechanised farm equipment and solar water pumps.',
      benefit_description: '50% subsidy on farm equipment up to ₹75,000',
      required_documents: 'Land Record, Farmer ID, Quotation of Equipment',
      is_active: true,
    },
    {
      name: 'Education Support',
      department: 'Education Department',
      description: '[DEMO DATA] Annual education grant for school and college students from middle-income families.',
      benefit_description: '₹8,000/year for school and college students',
      required_documents: 'Income Certificate, Marksheet, Bank Passbook',
      is_active: true,
    },
    {
      name: 'Rural Housing Assistance',
      department: 'Rural Development Department',
      description: '[DEMO DATA] Special rural housing grant for families in select districts with very low income.',
      benefit_description: '₹1,00,000 grant for rural pucca housing',
      required_documents: 'Income Certificate, Village Residence Proof, Land Documents',
      is_active: true,
    },
  ];

  const schemes = await Scheme.insertMany(schemeData);
  const [s1,s2,s3,s4,s5,s6,s7,s8,s9,s10] = schemes;

  const rule = (schemeId, scope, field, op, val) => ({
    scheme_id: schemeId, rule_scope: scope, field_name: field, operator: op, value: String(val), logical_group:'AND'
  });

  await SchemeRule.insertMany([
    // S1 — Student Scholarship
    rule(s1._id,'FAMILY','annual_income','<=','300000'),
    rule(s1._id,'MEMBER','education','==','STUDENT'),
    rule(s1._id,'MEMBER','age','>=','16'),

    // S2 — Farmer Assistance
    rule(s2._id,'MEMBER','occupation','==','FARMER'),
    rule(s2._id,'FAMILY','annual_income','<=','500000'),

    // S3 — Housing Assistance
    rule(s3._id,'FAMILY','annual_income','<=','250000'),

    // S4 — Girl Child Education
    rule(s4._id,'MEMBER','gender','==','Female'),
    rule(s4._id,'MEMBER','education','==','STUDENT'),
    rule(s4._id,'MEMBER','age','>=','6'),
    rule(s4._id,'MEMBER','age','<=','18'),

    // S5 — Women Assistance
    rule(s5._id,'MEMBER','gender','==','Female'),
    rule(s5._id,'FAMILY','annual_income','<=','300000'),

    // S6 — Skill Development
    rule(s6._id,'MEMBER','age','>=','18'),
    rule(s6._id,'MEMBER','age','<=','45'),

    // S7 — Senior Citizen
    rule(s7._id,'MEMBER','age','>=','60'),

    // S8 — Agriculture Equipment
    rule(s8._id,'MEMBER','occupation','==','FARMER'),
    rule(s8._id,'FAMILY','annual_income','<=','400000'),

    // S9 — Education Support (SSC / HSC / GRADUATE members, income <= 4L)
    // Using HSC as representative value (engine does string == per member)
    rule(s9._id,'MEMBER','education','==','HSC'),
    rule(s9._id,'FAMILY','annual_income','<=','400000'),

    // S10 — Rural Housing Assistance
    // Engine does string ==, so we use two rules: district == X OR income check
    // Use income rule only (district check would need IN operator not supported)
    rule(s10._id,'FAMILY','annual_income','<=','200000'),
    rule(s10._id,'FAMILY','district','==','Junagadh'),
  ]);

  const ruleCount = await SchemeRule.countDocuments();
  console.log(`✔  Created 10 schemes + ${ruleCount} scheme rules`);

  /* ══════════════════════════════════════════════════════
     6. APPLICATIONS (25)
     ══════════════════════════════════════════════════════
     Status breakdown:
       APPROVED     8   (20–60 days ago, with approval remarks)
       SUBMITTED    6   (1–7 days ago, no review)
       UNDER_REVIEW 5   (8–20 days ago, review started)
       REJECTED     4   (20–50 days ago, with rejection remarks)
       DRAFT        2
  ══════════════════════════════════════════════════════ */

  const approveRemark1 = 'Documents verified. Beneficiary approved.';
  const approveRemark2 = 'Eligible under scheme guidelines. Sanctioned.';
  const rejectRemark1  = 'Income certificate does not match declared income.';
  const rejectRemark2  = 'Required land documents are missing.';
  const rejectRemark3  = 'Applicant age does not meet the scheme criteria.';
  const rejectRemark4  = 'Duplicate application found for same scheme.';

  const app = (fid, sid, pid, status, daysOffset, remarks='') => ({
    family_id: fid,
    scheme_id: sid,
    applicant_person_id: pid,
    status,
    remarks: remarks || 'Applied by citizen via ParivarSathi portal',
    submitted_at: daysAgo(daysOffset),
  });

  await Application.insertMany([
    /* ── APPROVED (8) ── */
    // F01: Farmer + Student Scholarship eligible (income 1.8L, STUDENT age 17)
    app(f01._id, s2._id, p_rajesh._id,   'APPROVED', 45, approveRemark1),
    app(f01._id, s1._id, p_aarav._id,    'APPROVED', 38, approveRemark2),
    // F07: Farmer Assistance (income 2.2L, FARMER)
    app(f07._id, s2._id, p_hiren._id,    'APPROVED', 52, approveRemark1),
    // F08: Senior Citizen (Amrutbhai age ~72)
    app(f08._id, s7._id, p_amrut._id,    'APPROVED', 30, approveRemark1),
    // F12: Housing Assistance (income 1.5L <= 2.5L) + Women Assistance
    app(f12._id, s3._id, p_viththal._id, 'APPROVED', 40, approveRemark2),
    app(f12._id, s5._id, p_jiviben._id,  'APPROVED', 25, approveRemark1),
    // F02: Agriculture Equipment (income 2.4L, FARMER)
    app(f02._id, s8._id, p_bhavesh._id,  'APPROVED', 55, approveRemark2),
    // F04: Girl Child Education (daughter Priya age ~16, Female STUDENT)
    app(f04._id, s4._id, p_priya._id,    'APPROVED', 35, approveRemark1),

    /* ── SUBMITTED (6) — last 7 days ── */
    // F01: Housing Assistance (income 1.8L <= 2.5L)
    app(f01._id, s3._id, p_rajesh._id,   'SUBMITTED', 3),
    // F03: Girl Child Education (Anaya age ~12, Female STUDENT)
    app(f03._id, s4._id, p_anaya._id,    'SUBMITTED', 5),
    // F07: Agriculture Equipment (FARMER, income 2.2L <= 4L)
    app(f07._id, s8._id, p_hiren._id,    'SUBMITTED', 2),
    // F09: Skill Development (Nisha age ~36, 18–45)
    app(f09._id, s6._id, p_nisha._id,    'SUBMITTED', 6),
    // F12: Skill Development (Viththal age ~40, 18–45)
    app(f12._id, s6._id, p_viththal._id, 'SUBMITTED', 1),
    // F10: Senior Citizen (Sanjay age ~65)
    app(f10._id, s7._id, p_sanjay._id,   'SUBMITTED', 4),

    /* ── UNDER_REVIEW (5) — 8–20 days ago ── */
    // F02: Senior Citizen (Jashiben age ~69)
    app(f02._id, s7._id, p_jashiben._id, 'UNDER_REVIEW', 14),
    // F04: Farmer Assistance (Jagdish, FARMER)
    app(f04._id, s2._id, p_jagdish._id,  'UNDER_REVIEW', 10),
    // F06: Student Scholarship (Rohan age ~17, STUDENT, income 3L = exactly 3L <=3L)
    app(f06._id, s1._id, p_rohan._id,    'UNDER_REVIEW', 16),
    // F08: Rural Housing Assistance (income 2L <= 2L, Bhavnagar — edge district)
    app(f08._id, s10._id,p_kokilaben._id,'UNDER_REVIEW', 12),
    // F11: Education Support (Yash GRADUATE, income 5.5L — will fail income rule)
    app(f11._id, s9._id, p_yash._id,     'UNDER_REVIEW', 18),

    /* ── REJECTED (4) ── */
    // F05: Housing Assistance — REJECTED (income 6L >> 2.5L)
    app(f05._id, s3._id, p_kiran._id,    'REJECTED', 28, rejectRemark1),
    // F11: Farmer Assistance — REJECTED (occupation=BUSINESS not FARMER)
    app(f11._id, s2._id, p_mahesh._id,   'REJECTED', 33, rejectRemark2),
    // F09: Student Scholarship — REJECTED (income 5L > 3L)
    app(f09._id, s1._id, p_kavya._id,    'REJECTED', 21, rejectRemark1),
    // F10: Girl Child Education — REJECTED (Rekhaben age 62, not 6–18)
    app(f10._id, s4._id, p_rekhaben._id, 'REJECTED', 26, rejectRemark3),

    /* ── DRAFT (2) ── */
    app(f05._id, s6._id, p_aditya._id,   'DRAFT', 1),
    app(f06._id, s5._id, p_kirti._id,    'DRAFT', 2),
  ]);

  const totalApps = await Application.countDocuments();
  console.log(`✔  Created ${totalApps} applications`);

  /* ══════════════════════════════════════════════════════
     7. SUMMARY
  ══════════════════════════════════════════════════════ */
  const personCount = await Person.countDocuments();
  const famCount    = await Family.countDocuments();
  const userCount   = await User.countDocuments();
  const schemeCount = await Scheme.countDocuments();

  const byStatus = await Application.aggregate([{ $group:{ _id:'$status', count:{$sum:1} } }]);
  const statusMap = {};
  byStatus.forEach(s => statusMap[s._id] = s.count);

  console.log(`
✅  Seeded successfully
─────────────────────────────────────────────────────
  Users        : ${userCount}  (1 officer, 5 citizens)
  Persons      : ${personCount}
  Families     : ${famCount}
  Schemes      : ${schemeCount}
  Scheme Rules : ${ruleCount}
  Applications : ${totalApps}  (${statusMap.SUBMITTED||0} SUBMITTED, ${statusMap.UNDER_REVIEW||0} UNDER_REVIEW, ${statusMap.APPROVED||0} APPROVED, ${statusMap.REJECTED||0} REJECTED, ${statusMap.DRAFT||0} DRAFT)
─────────────────────────────────────────────────────
  LOGIN CREDENTIALS (password: Test@123 for all)
  Officer : officer@gujarat.gov.in       / Test@123
  Citizen : rajesh.patel@gmail.com       / Test@123
  Citizen : meena.shah@gmail.com         / Test@123
  Citizen : kiran.desai@gmail.com        / Test@123
  Citizen : hiren.rabari@gmail.com       / Test@123
  Citizen : nisha.solanki@gmail.com      / Test@123
─────────────────────────────────────────────────────

  DEMO FAMILIES (for manual testing):
  F01 Rajesh Patel  : Surendranagar / Chotila / Kherali       ₹1,80,000  → Farmer. Eligible: S1 S2 S3 S4 S5 S8
  F03 Meena Shah    : Rajkot / Gondal / Mavdi                 ₹2,40,000  → Women-headed. Eligible: S4 S5
  F05 Kiran Desai   : Ahmedabad / Sanand / Telav              ₹6,00,000  → High income. No housing schemes.
  F07 Hiren Rabari  : Bhavnagar / Sihor / Palitana Road       ₹2,20,000  → Farmer. Eligible: S2 S3 S8
  F09 Nisha Solanki : Vadodara / Padra / Sevasi               ₹5,00,000  → Govt job. Limited eligibility.
  F12 Viththalbhai  : Junagadh / Keshod / Mesvan              ₹1,50,000  → Very low income. Eligible: S3 S5 S6 S10
─────────────────────────────────────────────────────`);

  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
