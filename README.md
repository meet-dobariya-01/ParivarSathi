# ParivarSathi (પરિવાર સાથી) 🏛️
### *Unified Family ID Beneficiary Platform for Gujarat*

> **Hackathon MVP Solution** for *"Introduction of Family ID in Gujarat to improve beneficiary management for various government schemes."*

---

## 🎯 Key Features Implemented

1. **Authentication & Roles**:
   - JWT-based authentication for **Citizen** and **Officer** roles.
   - Built-in 1-click demo login buttons.

2. **Person & Family Management (Family Registry)**:
   - One unique public Family ID per household: e.g. `GJ-FAM-7K3P9X2M` (no sensitive personal data encoded).
   - Strict Business Rule: **A citizen can belong to only ONE active family at a time.**
   - Add/manage household members (Head, Spouse, Son, Daughter, Father, etc.) with age, gender, occupation, and education.

3. **Generic Rule-Based Eligibility Engine ⭐**:
   - Zero hardcoding — dynamic rules read directly from MongoDB `scheme_rules`.
   - Supports both **`FAMILY` scope** (income, district, taluka, village) and **`MEMBER` scope** (age, gender, occupation, education).
   - Multi-member evaluation (e.g. discovers if a Son qualifies for Student Scholarship or a Father qualifies for Senior Citizen Pension).
   - Generates human-readable explanations (`matched_rules` & `failed_rules`).

4. **"Find Schemes for My Family"**:
   - Live automated scan of all active welfare schemes against the household.
   - Displays eligible vs ineligible schemes with required documents and instant application submission.

5. **Scheme Application & Live Status Tracking**:
   - Lifecycle: `SUBMITTED` ➔ `UNDER_REVIEW` ➔ `APPROVED ✓` / `REJECTED`.
   - Citizens see their application tracking dashboard with officer remarks.

6. **Government Officer Dashboard & Analytics**:
   - High-level KPIs: Total Families, Total Members, Total Applications, Pending, Approved, and Rejected.
   - Interactive **Recharts** charts:
     - Applications by Scheme
     - Application Status Distribution
     - Families by District
   - Application review portal to approve/reject with remarks.
   - Scheme management: create schemes, toggle active/inactive, configure dynamic eligibility rules.

---

## 🔑 Demo Credentials

| Role | Email | Password | Notes |
|---|---|---|---|
| **Officer** | `officer@gujarat.gov.in` | `password123` | Dr. Harshil Mehta (District Welfare Officer) |
| **Citizen 1** | `rajesh@gmail.com` | `password123` | Rajesh Patel (Surendranagar, Farmer Household with Student Son) |
| **Citizen 2** | `priya@gmail.com` | `password123` | Priya Sharma (Ahmedabad, Teacher with Senior Citizen Father) |

---

## 🚀 How to Run

### 1. Backend
```bash
cd server
npm install
node seed.js    # Populates MongoDB Atlas with 10 demo schemes, rules, families, and demo applications
node index.js   # Starts Express backend on http://localhost:5000
```

### 2. Frontend
```bash
cd client
npm install
npm run dev     # Starts Vite React on http://localhost:5173
```
