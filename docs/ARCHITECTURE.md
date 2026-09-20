# ParivarSathi Architecture

## 1) High-level system architecture

```mermaid
flowchart TB
  subgraph Users["Users / Roles"]
    U1["Citizen"]
    U2["Officer / Admin"]
  end

  subgraph Frontend["Frontend Layer"]
    FE["React 18 + Vite\nReact Router + Tailwind\nreact-i18next (EN / GU / HI)\nRecharts + axios"]
  end

  subgraph API["API Layer"]
    GW["Express REST API\nJWT Auth\nValidation\nRate Limiting\nError Handling"]
  end

  subgraph Modules["Backend Modules"]
    M1["Auth & Role Module"]
    M2["Family Registry"]
    M3["Eligibility Engine"]
    M4["Duplicate & Fraud Detection"]
    M5["Application Tracking"]
    M6["Admin Analytics"]
  end

  subgraph Data["Data Layer"]
    DB["MongoDB Atlas\nMongoose Models"]
  end

  subgraph Security["Security & Compliance"]
    SEC["HTTPS\nJWT\nPassword Hashing\nID Hashing + Salt\nRBAC\nInput Validation\nAudit Logging\nData Minimization"]
  end

  subgraph External["External / Future Integrations"]
    EX1["Aadhaar Verification\n(masked/hash only)"]
    EX2["DigiLocker"]
    EX3["Existing Scheme DB APIs"]
    EX4["SMS / Email Notifications"]
  end

  U1 --> FE
  U2 --> FE
  FE --> GW
  GW --> M1
  GW --> M2
  GW --> M3
  GW --> M4
  GW --> M5
  GW --> M6

  M1 --> DB
  M2 --> DB
  M3 --> DB
  M4 --> DB
  M5 --> DB
  M6 --> DB

  SEC -. protects .-> FE
  SEC -. protects .-> GW
  SEC -. protects .-> DB

  EX1 -. future .-> GW
  EX2 -. future .-> GW
  EX3 -. future .-> GW
  EX4 -. future .-> GW

  classDef frontend fill:#0B1F3A,stroke:#0B1F3A,color:#ffffff,stroke-width:1.5px;
  classDef backend fill:#D97706,stroke:#B45309,color:#ffffff,stroke-width:1.5px;
  classDef db fill:#15803D,stroke:#166534,color:#ffffff,stroke-width:1.5px;
  classDef sec fill:#4B5563,stroke:#374151,color:#ffffff,stroke-width:1.5px;
  classDef ext fill:#9CA3AF,stroke:#6B7280,color:#111827,stroke-width:1.5px,stroke-dasharray: 5 5;

  class U1,U2,FE frontend;
  class GW,M1,M2,M3,M4,M5,M6 backend;
  class DB db;
  class SEC sec;
  class EX1,EX2,EX3,EX4 ext;
```

## 2) Request flow: Citizen clicks Find Benefits

```mermaid
sequenceDiagram
  actor Citizen
  participant UI as React Frontend
  participant API as Express API
  participant Auth as Auth Middleware
  participant Engine as Eligibility Engine
  participant DB as MongoDB
  participant View as Benefits UI

  Citizen->>UI: Clicks Find Benefits
  UI->>API: GET /api/eligibility/family?familyId=...
  API->>Auth: Validate JWT + Role
  Auth-->>API: Authorized Citizen
  API->>Engine: Evaluate family/member eligibility
  Engine->>DB: Read Family, Members, Schemes, Applications
  DB-->>Engine: Household + policy + enrollment data
  Engine->>Engine: Match rules, detect missed/enrolled
  Engine-->>API: eligible + enrolled + missed schemes
  API-->>UI: JSON response
  UI->>View: Render eligible vs missed results
  View-->>Citizen: Show scheme recommendations
```

## 3) Data model / ER diagram

```mermaid
erDiagram
  USER ||--o{ FAMILY : manages
  USER ||--o{ APPLICATION : reviews
  USER ||--o{ AUDITLOG : performs

  FAMILY ||--o{ MEMBER : contains
  FAMILY ||--o{ APPLICATION : has
  FAMILY ||--o{ DUPLICATEFLAG : flagged_by
  FAMILY ||--o{ AUDITLOG : logs

  MEMBER ||--o{ APPLICATION : applies_for
  MEMBER ||--o{ AUDITLOG : logs

  SCHEME ||--o{ APPLICATION : matches
  SCHEME ||--o{ AUDITLOG : logs

  USER {
    ObjectId id
    string name
    string email
    string passwordHash
    string role
    string phone
    date createdAt
  }

  FAMILY {
    ObjectId id
    string familyId
    string district
    string taluka
    string village
    string address
    number annualIncome
    ObjectId headMemberId
    boolean isActive
    date createdAt
  }

  MEMBER {
    ObjectId id
    ObjectId familyId
    ObjectId userId
    string name
    date dob
    string gender
    string relationship
    string occupation
    string education
    boolean isHead
    boolean isActive
  }

  SCHEME {
    ObjectId id
    string schemeCode
    string name
    string department
    string category
    string status
    json eligibilityRules
    date createdAt
  }

  APPLICATION {
    ObjectId id
    ObjectId familyId
    ObjectId memberId
    ObjectId schemeId
    ObjectId applicantUserId
    ObjectId reviewerUserId
    string status
    string stage
    string remarks
    date appliedAt
    date updatedAt
  }

  DUPLICATEFLAG {
    ObjectId id
    ObjectId familyId
    ObjectId memberId
    string reason
    string matchType
    number similarityScore
    boolean resolved
    date createdAt
  }

  AUDITLOG {
    ObjectId id
    ObjectId userId
    ObjectId familyId
    ObjectId memberId
    ObjectId applicationId
    string action
    string details
    date createdAt
  }
```

## 5-line deployment plan

1. Build the frontend around citizen and officer dashboards with role-based access.
2. Keep the backend modular so eligibility, duplicate checks, and analytics remain independent.
3. Store family and member data in MongoDB with a normalized join model for applications.
4. Add security controls at the API and data layer before production rollout.
5. Deploy frontend to Vercel and backend to Render, with MongoDB Atlas as the persistent data store.
