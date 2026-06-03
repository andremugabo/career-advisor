# Emmerence AI Career Path Advisor

> An enterprise-grade, AI-driven career matching, analysis, and tracking system designed for the Emmerence Thesis Project.

This monorepo contains the full architecture for the **AI Career Path Advisor**, connecting student profiles and skill sets to industry career clusters utilizing high-fidelity REST APIs, a robust cosine similarity matching engine, and an elegant glassmorphic client interface.

---

## 🌟 Key Capabilities & Domain Modules

The platform is divided into robust, decoupled domain modules located under `backend/apps/` that fully fulfill the 12 Thesis Functional Requirements (FRs):

### 1. AI-Driven Career Analysis Engine (`FR-04` & `FR-05`)
* **Vectorization Engine**: Automatically translates a student's technical and soft skills into multi-dimensional vectors using [vectorizer.py](file:///Users/ntgr/Desktop/This.Mac/MYPROJECT/EMMERENCE/career-advisor/backend/ai/similarity/vectorizer.py).
* **Cosine Similarity**: Calculates dynamic mathematical similarity percentages against all 904 seeded O*NET career clusters using [cosine.py](file:///Users/ntgr/Desktop/This.Mac/MYPROJECT/EMMERENCE/career-advisor/backend/ai/similarity/cosine.py), ranking matches by compatibility.
* **Skill Gap Analysis**: Compares a student's current skill profile against any career cluster requirements and highlights missing items in real-time.

### 2. Student Profile & Skills Aggregator (`FR-02` & `FR-03`)
* **Profile Management**: Exposes `/api/profiles/me/` for viewing and patching student GPA, academic year, full name, and bio, featuring input sanitation.
* **Skills Dictionary**: Houses 533 master technical and soft skills, searchable case-insensitively via `/api/skills/?search=python`.
* **Proficiency Mapping**: Enables students to add, list, and delete active competencies, tracking exact proficiency indices (1 to 5) in `StudentSkill` relational maps.
* **Transcript Upload & Parsing**: A built-in PDF parsing pipeline that reads uploaded transcripts, extracts course records and GPA, and populates student profiles.

### 3. Certification Pathways & Bridges (`FR-07`)
* **Standard Professional Certifications**: Tracks certifications (AWS, Coursera, Google) mapped to missing skill gaps.
* **Learning Tracker**: Enables students to log professional learning tracks under `/api/certifications/my/`, flagging courses as `'Planning'` or marking them `'Completed'` with completion dates.

### 4. Intelligent Opportunities & Internships (`FR-08`)
* **Intelligent AI Sorting**: Accessing `/api/internships/?matched=true` automatically hooks into the similarity engine, maps internship cluster requirements, and dynamically sorts openings by the student's compatibility score!
* **Safe Application Pipeline**: Enables students to submit applications under `/api/applications/` with automated uniqueness checks to prevent duplicate submissions.

### 5. Advisor Oversight & Security Controls (`FR-09`, `FR-10`, `FR-11`)
* **Granular RBAC**: Protects advisor panels via custom `IsAdvisorOrAdmin` permission class, blocking student tokens (`403 Forbidden`).
* **Advisor Monitoring Panel**: Exposes `/api/advisors/students/` to authenticated advisors, rendering all student profiles, GPA scores, and their top-3 AI recommendations.
* **IP Auditing Traces**: Monitors changes to critical academic fields (GPA, program, year) and logs before-and-after state transitions directly in `AuditLog` rows alongside the client IP address.

---

## 🖥️ Portal Features & User Roles

### 🎓 Student Portal (11 Pages)
* **Dashboard**: Modern dashboard summarizing current GPA, skills count, recent assessment recommendations, and current applications.
* **My Profile**: Profile editor with an integrated **Academic Transcript (PDF) Upload** component.
* **Skills & Certs**: Visual track of skills and certifications.
* **Assessment**: RIASEC-based interactive questionnaire submitting to the AI recommendation engine.
* **AI Recommendations**: View career clusters, skill gaps, and export recommendations to **PDF** or **Share with Advisor**.
* **Career Path**: Visual timeline flowchart showing target entry-level to senior progressions.
* **Compare Careers**: Side-by-side comparison matrix comparing up to 3 careers.
* **Saved Careers**: Keep track of bookmarked favorites.
* **Internships**: Search, filter by location/type, and apply directly.
* **My Applications**: Status board (Pending, Reviewed, Accepted, Rejected) tracking student applications.
* **Resource Library**: Directory of study guides and resources.

### 🧑‍💼 Advisor Portal (5 Pages)
* **Dashboard Home**: Analytics cards, visual metrics, quick action links, and recent interventions feed.
* **Students**: Comprehensive drill-down modal showcasing profile statistics, transcripts, and AI recommendations.
* **Messages**: Real-time communication view enabling advisors to message their assigned students.
* **Interventions**: Expanded history of student academic/career interventions.
* **Resource Library**: Full CRUD resource creator (create, read, edit, delete resources) for students to read.

### 🔧 Admin Portal (6 Pages)
* **Dashboard**: Live system statistics (Total users, Active sessions, Security incidents, Logs count).
* **User Management**: Active CRUD manager to add, edit, suspend, or delete users and alter RBAC roles.
* **System Analytics**: Visual Permisson Matrix, Encryption Status tracker, failed login anomalies log, and **Export Audit CSV** module.
* **App & Jobs**: Administrative controller for internship vacancies.
* **Global Content**: Seed control and database content updates.
* **System Settings**: Configurable platform attributes.

---

## 💻 Technology Stack

* **Backend Framework**: Python / Django / Django REST Framework (DRF)
* **Database**: PostgreSQL (Production-grade schema including polymorphics and indexes)
* **Authentication**: JWT (JSON Web Tokens) with automated token rotation (`rest_framework_simplejwt`), featuring MFA and Email OTP verification.
* **Frontend Client**: React / Vite / TypeScript / Recharts (Interactive glassmorphic panel)
* **API Spec & Docs**: OpenAPI 3.0 / Swagger UI integrated via `drf-spectacular`

---

## 📂 Repository Structure

```text
career-advisor/
├── backend/            # Django REST API, matching algorithms, and models
│   ├── ai/             # Vectorizers, Cosine similarity math, and CareerRecommender
│   ├── apps/           # 13 isolated Domain Modules (skills, internships, advisors, audit, etc.)
│   ├── config/         # System configurations (URL routing, JWT settings, CORS definitions)
│   ├── core/           # Audit models, pagination, and custom DRF exception handlers
│   └── venv/           # Dedicated Python virtual environment
├── frontend/           # Glassmorphic React Vite Client Application
│   ├── src/
│   │   ├── api/        # Authenticated REST Client wrapper
│   │   ├── components/ # Common UI Layout elements (Sidebar, Topbar, Buttons, Cards)
│   │   ├── features/   # Login UI, Recharts Compatibility Charts, Dashboard views
│   │   ├── routes/     # Protected router matching pathways
│   │   └── services/   # Client services mapping requests directly to API endpoints
│   └── package.json    # Frontend dependency mappings
└── docs/               # Thesis LaTeX documents and design assets
```

---

## 🚀 Getting Started

### 1. Installation & Environment Configuration
Clone the repository and access the backend folder:
```bash
git clone https://github.com/andremugabo/career-advisor.git
cd career-advisor/backend
```

> [!IMPORTANT]
> **Virtual Environment Requirement**:
> On macOS/Linux, running generic `python` command directly in the shell will result in `zsh: command not found: python`.
> You **MUST** either activate the virtual environment first, or use `python3` / `venv/bin/python` to invoke Django tasks.

Activate the dedicated Python virtual environment:
```bash
source venv/bin/activate  # On Windows, use: venv\Scripts\activate
```

Create a `.env` file inside the `backend/` directory:
```env
# backend/.env 
SECRET_KEY="django-insecure-your-secret-key"
DATABASE_URL="postgres://postgres:123@localhost:5432/career-advisor_db"
```

### 2. Schema Migrations & Seeding Mappings
First, execute schema migrations to initialize all tables, then run the seeders to populate the database:

```bash
# 1. Push database schemas to PostgreSQL
python manage.py migrate

# 2. Seed 904 O*NET Career Clusters and core Skills dictionary
python manage.py seed_onet

# 3. Seed professional certifications mapped to technical skills
python manage.py seed_certs

# 4. Seed mock internship vacancies matching career clusters
python manage.py seed_internships

# 5. Create or reset the master admin user
python create_admin.py
```
*(If you are running without activating the virtual environment, replace `python` with `python3` in all commands above).*

### 3. System Passwords Cheat Sheet

**System Account Passwords** (Used for application login or `/admin/` portal):
* **Super Admin / Root User** (`admin@auca.ac.rw`): `123`
* **Test Advisor Account** (`test_advisor_api@auca.ac.rw`): `advisorpass123`
* **Test Student Account** (`test_student_api@auca.ac.rw`): `studentpass123`

**Infrastructure & Environment Passwords** (Located in `backend/.env`):
* **PostgreSQL Database Password**: `123` *(Username: `postgres`)*
* **Gmail SMTP App Password**: `qavmtqovwbsdwwyf` *(Used for welcome emails and OTP resets)*

### 4. Running the Dev Servers
```bash
# Start backend on http://127.0.0.1:8000
# Ensure you are inside the backend/ directory and activate the virtual environment first
source venv/bin/activate
python manage.py runserver  # Or: python3 manage.py runserver

# Start frontend (in a separate terminal inside frontend/ directory)
cd ../frontend
npm run dev
```

---

## 🔍 API Specs & Interactive Testing

* **Swagger UI Dashboard**: [http://127.0.0.1:8000/api/docs/](http://127.0.0.1:8000/api/docs/) (Interactively query endpoints with JWT auth)
* **Raw Spec Schema**: [http://127.0.0.1:8000/api/schema/](http://127.0.0.1:8000/api/schema/)

---

## 🧪 Comprehensive Automated Test Suites

The project features a highly robust automated testing suite to verify all business rules, calculations, and security boundaries.

### 1. Live REST API Integration test
This command spins up the Django client, mock-logs in student/advisor sessions, updates academic profiles, asserts audit logging, adds/deletes skills, enrolls in certifications, and verifies advisor access restrictions:
```bash
python manage.py test_all_features  # Or: python3 manage.py test_all_features
```

### 2. Handshake Connectivity Check
Run this script to verify that the live servers are up, healthy, and correctly passing auth headers:
```bash
python dataset/test_server_connectivity.py  # Or: python3 dataset/test_server_connectivity.py
```
