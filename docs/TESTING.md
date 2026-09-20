# ParivarSathi — Manual E2E Test Guide

> **DEMO DATA DISCLAIMER**: All data in this database is fictional and created for testing purposes only.  
> This is not an official Government of Gujarat service.

---

## 1. Prerequisites

```bash
# Terminal 1 — Backend
cd c:\Users\MEET\OneDrive\Desktop\PRAVI\server
npm install
npm run seed          # wipes DB and populates realistic demo data
npm run dev           # starts on http://localhost:5000

# Terminal 2 — Frontend
cd c:\Users\MEET\OneDrive\Desktop\PRAVI\client
npm install
npm run dev           # starts on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## 2. Demo Login Credentials

| Role    | Email                          | Password  | Family / Notes                           |
|---------|--------------------------------|-----------|------------------------------------------|
| OFFICER | officer@gujarat.gov.in         | Test@123  | Rameshbhai Chauhan — full dashboard      |
| CITIZEN | rajesh.patel@gmail.com         | Test@123  | F01 Surendranagar — Farmer ₹1.8L         |
| CITIZEN | meena.shah@gmail.com           | Test@123  | F03 Rajkot — Women-headed ₹2.4L          |
| CITIZEN | kiran.desai@gmail.com          | Test@123  | F05 Ahmedabad — High income ₹6L          |
| CITIZEN | hiren.rabari@gmail.com         | Test@123  | F07 Bhavnagar — Farmer ₹2.2L             |
| CITIZEN | nisha.solanki@gmail.com        | Test@123  | F09 Vadodara — Govt job ₹5L              |

---

## TEST 1 — Citizen Registration & Login

### Steps

1. Open http://localhost:5173 → redirected to `/login`
2. Click **"Register"** link
3. Fill in:
   - Name: `Test Citizen`
   - Email: `test.citizen@gmail.com`
   - Password: `Test@123`
   - Gender: Male | DOB: `2000-06-15`
4. Click **Register**

**✓ Expected**: Redirected to `/dashboard`. Welcome card shows "Test Citizen". "Create your family" CTA visible.

5. Click **Logout**
6. Login with `test.citizen@gmail.com` / `Test@123`

**✓ Expected**: Successfully logged in, same dashboard.

7. Try logging in with wrong password: `WrongPass`

**✓ Expected**: Error toast/message "Invalid email or password". No redirect.

---

## TEST 2 — Create a New Family

*(Using the freshly registered `test.citizen@gmail.com`)*

### Steps

1. Login as `test.citizen@gmail.com`
2. On dashboard, click **"Create Your Family"** or navigate to `/family`
3. Fill in the Create Family form:
   - Annual Income: `250000`
   - Address: `House No. 5, Near School, Kherali`
   - District: `Surendranagar`
   - Taluka: `Chotila`
   - Village: `Kherali`
4. Click **"Create Family"**

**✓ Expected**:
- Family created successfully
- Family ID appears in format `GJ-FAM-XXXXXXXX` (8 random chars)
- Dashboard quick stats show **1 member**
- `/family` page shows family details card

---

## TEST 3 — Add Family Members

*(Continuing as `test.citizen@gmail.com`)*

### Steps

1. Navigate to `/family` (or click "My Family" in nav)
2. Click **"Add Member"**
3. Add **Spouse**:
   - Name: `Priya Citizen`
   - DOB: `2002-03-20`
   - Gender: Female
   - Relationship: SPOUSE
   - Occupation: HOMEMAKER | Education: HSC
4. Click **Add**

**✓ Expected**: Member table updates. Member count = 2.

5. Click **"Add Member"** again — add **Student child**:
   - Name: `Rohan Citizen`
   - DOB: `2007-09-10`   ← age ~17
   - Gender: Male | Relationship: SON
   - Occupation: STUDENT | Education: STUDENT
6. Add another member — **Farmer**:
   - Name: `Dinesh Citizen`
   - DOB: `1984-04-15`   ← age ~40
   - Gender: Male | Relationship: OTHER
   - Occupation: FARMER | Education: SSC

**✓ Expected**: Member table shows 4 rows (HEAD + SPOUSE + SON + OTHER). Ages computed correctly from DOB.

7. Try clicking **Deactivate** on the HEAD member (yourself)

**✓ Expected**: Error — "Cannot deactivate Family Head directly"

---

## TEST 4 — Find Benefits (Eligibility Engine)

*(Using `test.citizen@gmail.com` — income ₹2,50,000, Surendranagar, has STUDENT age 17 and FARMER member)*

### Steps

1. Click **"Find Benefits"** button on dashboard or navigate to `/find-schemes`
2. Wait for eligibility results to load

**✓ Expected Eligible Schemes**:

| Scheme | Why Eligible |
|--------|--------------|
| **Student Scholarship** | income ≤ 3L ✓, STUDENT member ✓, age ≥ 16 ✓ (Rohan age 17) |
| **Farmer Assistance** | FARMER member ✓ (Dinesh), income ≤ 5L ✓ |
| **Housing Assistance** | income ≤ 2.5L ✓ (exactly 2,50,000) |
| **Women Assistance** | Female member ✓ (Priya), income ≤ 3L ✓ |
| **Skill Development** | Members in 18–45 age range ✓ |
| **Agriculture Equipment** | FARMER member ✓, income ≤ 4L ✓ |

**✓ Expected NOT Eligible**:

| Scheme | Why Failed |
|--------|------------|
| **Senior Citizen Assistance** | No member age ≥ 60 |
| **Girl Child Education** | No Female STUDENT member aged 6–18 (Priya=HOMEMAKER, Rohan=Male) |
| **Rural Housing Assistance** | district rule (Junagadh only) + income may fail |

3. Verify each eligible scheme shows **"Why Eligible"** bullet list with human-readable rule explanations (e.g. `annual income (250000) satisfied requirement: <= 300000`)
4. Verify not-eligible schemes show **failed rules** with actual values

---

## TEST 5 — Apply for a Scheme

*(Continuing as `test.citizen@gmail.com`)*

### Steps

1. On the eligible schemes page, find **Student Scholarship**
2. Click **"Apply Now"** → choose member: Rohan Citizen (the student)
3. Click **Apply / Submit**

**✓ Expected**:
- Success toast notification
- Redirected to `/applications` or application detail
- Application status badge shows **SUBMITTED** (blue)

4. Go back to eligible schemes and try clicking **Apply Now** for Student Scholarship again for the same member

**✓ Expected**: Error toast — "An application is already active (SUBMITTED) for this scheme and member."  Status 400.

---

## TEST 6 — Officer Reviews Application

### Steps

1. Logout → Login as **`officer@gujarat.gov.in`** / `Test@123`
2. Navigate to **`/officer/dashboard`**

**✓ Expected Stats (after seed)**:
| Metric | Expected |
|--------|----------|
| Total Families | 12 |
| Total Members | ~45 |
| Total Applications | ~26 (25 seeded + 1 new) |
| Pending | ~12 (SUBMITTED + UNDER_REVIEW) |
| Approved | 8 |
| Rejected | 4 |

3. Verify all **3 charts** render:
   - Bar chart: "Applications by Scheme" — shows bars for multiple schemes
   - Pie chart: "Application Status Distribution" — shows 5 coloured segments
   - Bar chart: "Families by District" — shows 6+ districts

4. Navigate to **`/officer/applications`**
5. Use the **Status filter** → select `SUBMITTED`
6. Find the new Student Scholarship application (most recent)
7. Click **"Review / Action"**

**✓ Expected**: Modal opens showing:
- Scheme: Student Scholarship
- Beneficiary: Rohan Citizen
- Family ID: GJ-FAM-XXXXXXXX

8. Select status **UNDER_REVIEW** → click **Confirm Decision**

**✓ Expected**: Status updates to UNDER_REVIEW. Table refreshes.

9. Open the same application again → select **APPROVED** → add remarks: `Documents verified. Scholarship sanctioned.` → Confirm

**✓ Expected**: Status changes to APPROVED (green badge).

10. Try clicking **Confirm Decision** without any remarks on a different application

**✓ Expected**: Browser validation prevents submission (remarks field is required).

---

## TEST 7 — Citizen Sees Updated Status

### Steps

1. Logout → Login as **`test.citizen@gmail.com`**
2. Navigate to **`/applications`**

**✓ Expected**: The Student Scholarship application shows **APPROVED** badge (green).

3. Click on the application (or view details)

**✓ Expected**: Officer remarks visible: `"Documents verified. Scholarship sanctioned."`

---

## TEST 8 — Officer Scheme Management

### Steps

1. Login as officer, navigate to **`/officer/schemes`**
2. Verify all 10 seeded schemes are visible (mix of active)
3. Click **"New Scheme"**
4. Fill in:
   - Name: `Test Rural Water Scheme`
   - Department: `Water Supply Department`
   - Description: `Test scheme for water supply`
   - Benefit: `₹2,000 one-time water connection subsidy`
   - Required Docs: `Income Certificate, Village Proof`
5. Click **Create Scheme**

**✓ Expected**: New scheme card appears in the list.

6. Click **"Add Rule"** on the new scheme → add rule:
   - Scope: FAMILY | Field: annual_income | Operator: <= | Value: 200000
7. Add second rule: MEMBER | age >= 18
8. Click **Active/Inactive toggle** to deactivate the scheme

**✓ Expected**: Scheme card dims / shows "Inactive" badge.

9. Open a new incognito tab → login as `rajesh.patel@gmail.com` → navigate to Find Benefits

**✓ Expected**: The "Test Rural Water Scheme" does NOT appear in eligible/not-eligible lists (it's inactive).

10. Back as officer, toggle the scheme back to **Active**

**✓ Expected**: Scheme reappears for citizens.

---

## TEST 9 — Edge Cases (API Level)

Open browser DevTools → Network tab, or use curl:

### 9.1 — Unauthenticated request
```
GET /api/family/my-family  (no Authorization header)
```
**✓ Expected**: HTTP 401 — `{"message": "Not authorized, no token"}`

### 9.2 — Wrong role (citizen tries officer endpoint)
Login as citizen → try in DevTools:
```javascript
fetch('/api/scheme', {
  method: 'POST',
  headers: { 'Content-Type':'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('parivar_token') },
  body: JSON.stringify({ name:'Hack', department:'X', description:'Y' })
}).then(r => r.json()).then(console.log)
```
**✓ Expected**: HTTP 403 — `{"message": "Not authorized as officer"}`

### 9.3 — Duplicate family creation
Login as `rajesh.patel@gmail.com` (already has a family) → try creating another family via the form.

**✓ Expected**: Error — "Business Rule Violation: A person can belong to only ONE active family at a time."

### 9.4 — Invalid login
```
POST /api/auth/login  → {"email":"nobody@x.com","password":"wrong"}
```
**✓ Expected**: HTTP 401 — `{"message": "Invalid email or password"}`

---

## TEST 10 — Refresh Persistence

### Steps

1. Login as any citizen
2. Note the current page (e.g., `/dashboard`)
3. Press **F5 / Ctrl+R** to hard refresh

**✓ Expected**: Still logged in. Token persisted in `localStorage` under key `parivar_token`.

4. Open DevTools → Application → Local Storage → `http://localhost:5173`
5. Find `parivar_token` → double-click → change a few characters to corrupt it
6. Refresh the page

**✓ Expected**: Redirected to `/login`. App gracefully handles invalid token.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `MongoServerError: connect ECONNREFUSED` | MongoDB Atlas unreachable — check internet / Atlas whitelist IP |
| `CORS error` in browser | Verify `npm run dev` runs on port 5000 and Vite proxy is `http://localhost:5000` |
| Port 5000 already in use | Change `PORT=5001` in `server/.env`, update Vite proxy in `client/vite.config.js` |
| Port 5173 already in use | Vite auto-picks next port (5174). Check terminal output for actual URL |
| Charts on officer dashboard are empty | Re-run `npm run seed` — clears and repopulates all data |
| JWT expired / 401 errors | Logout → Login again. Tokens expire after 30 days |
| Seeded but 0 families shown | Verify `MONGODB_URI` in `server/.env` points to correct DB |
| `npm run seed` fails with schema error | Delete node_modules, re-run `npm install`, then `npm run seed` |

---

## Quick API Smoke Test (curl)

### Health check
```bash
curl http://localhost:5000/api/health
# Note: if no /health endpoint, check server.js — use /api/auth/login as sanity check
```

### Login as officer — get token
```bash
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"officer@gujarat.gov.in","password":"Test@123"}' | python -m json.tool
```

### Save token (PowerShell)
```powershell
$TOKEN = (curl -s -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"officer@gujarat.gov.in","password":"Test@123"}' | ConvertFrom-Json).token
```

### Save token (bash/Git Bash)
```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"officer@gujarat.gov.in","password":"Test@123"}' | python -c "import sys,json; print(json.load(sys.stdin)['token'])")
```

---

### Dashboard summary (officer)
```bash
curl http://localhost:5000/api/dashboard/summary \
  -H "Authorization: Bearer $TOKEN"
```
**✓ Expected**:
```json
{
  "totalFamilies": 12,
  "totalMembers": 45,
  "totalApplications": 25,
  "pendingApplications": 11,
  "approvedApplications": 8,
  "rejectedApplications": 4
}
```

### Applications by scheme (chart data)
```bash
curl http://localhost:5000/api/dashboard/applications-by-scheme \
  -H "Authorization: Bearer $TOKEN"
```
**✓ Expected**: Array of `{ schemeName, count }` sorted descending. At least 6 schemes with count ≥ 1.

### Families by district (chart data)
```bash
curl http://localhost:5000/api/dashboard/families-by-district \
  -H "Authorization: Bearer $TOKEN"
```
**✓ Expected**: Array like `[{ "district":"Surendranagar","count":2 }, ...]` — 6+ districts.

### Applications by status
```bash
curl http://localhost:5000/api/dashboard/applications-by-status \
  -H "Authorization: Bearer $TOKEN"
```
**✓ Expected**: All 5 statuses present, including zero-count ones:
```json
[
  {"status":"DRAFT","count":2},
  {"status":"SUBMITTED","count":6},
  {"status":"UNDER_REVIEW","count":5},
  {"status":"APPROVED","count":8},
  {"status":"REJECTED","count":4}
]
```

### Get all schemes
```bash
curl http://localhost:5000/api/scheme \
  -H "Authorization: Bearer $TOKEN"
```
**✓ Expected**: Array of 10 schemes, each with `rules` array populated.

---

### Login as citizen — Rajesh Patel
```bash
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rajesh.patel@gmail.com","password":"Test@123"}'
```

### Citizen: get own family
```bash
CITIZEN_TOKEN=<paste_citizen_token_here>

curl http://localhost:5000/api/family/my-family \
  -H "Authorization: Bearer $CITIZEN_TOKEN"
```
**✓ Expected**: `{ "hasFamily": true, "family": { "family_id": "GJ-FAM-...", "district": "Surendranagar", ... }, "members": [...] }`

### Citizen: check eligibility (replace FAMILY_MONGO_ID with _id from above response)
```bash
FAMILY_ID=<paste_family._id_from_above>

curl "http://localhost:5000/api/eligibility/my-family" \
  -H "Authorization: Bearer $CITIZEN_TOKEN"
```
**✓ Expected**: `{ "eligible_schemes": [...], "not_eligible_schemes": [...] }` — Rajesh should have 5+ eligible schemes.

### Citizen: get own applications
```bash
curl http://localhost:5000/api/application/my-applications \
  -H "Authorization: Bearer $CITIZEN_TOKEN"
```
**✓ Expected**: Array of applications for F01 family.

### Officer: get all applications
```bash
curl "http://localhost:5000/api/application/all?status=SUBMITTED" \
  -H "Authorization: Bearer $TOKEN"
```
**✓ Expected**: 6 applications with status SUBMITTED.

### Officer: approve an application (replace APP_ID)
```bash
APP_ID=<paste_application_id>

curl -X PUT "http://localhost:5000/api/application/${APP_ID}/review" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"APPROVED","remarks":"Verified by District Officer. Sanctioned."}'
```
**✓ Expected**: Updated application document with status APPROVED.

---

## Checklist — Final Verification

```
[ ] npm run seed runs successfully and prints summary table
[ ] All 6 login credentials work (officer + 5 citizens)
[ ] Officer dashboard shows 12 families, ~45 members, 25 applications
[ ] All 3 charts render with non-zero data
[ ] Rajesh Patel (rajesh.patel@gmail.com) has 5+ eligible schemes
[ ] Kiran Desai (kiran.desai@gmail.com, income 6L) has Housing Assistance as NOT eligible
[ ] Applications list shows all 5 statuses (DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED)
[ ] Officer can approve/reject with remarks
[ ] Citizen sees updated status after officer action
[ ] Deactivating HEAD member gives clear error
[ ] Duplicate application attempt gives clear error
[ ] Unauthenticated /api/family/my-family → 401
[ ] Non-officer creating scheme → 403
```
