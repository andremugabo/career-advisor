# Emmerence AI Career Path Advisor

> An enterprise-grade, AI-driven career matching and analysis system designed for the Emmerence Thesis Project. 

This repository contains the full architecture for the AI Career Path Advisor, connecting student profiles to industry career clusters using a high-fidelity REST API. Built tightly on a domain-driven microservice pattern, the platform utilizes advanced JSON Web Token authentication, PostgreSQL constraints, and granular Object-Relational architectures.

---

## Technology Stack

- **Backend Framework**: Python / Django 5 / Django REST Framework (DRF)
- **Database**: PostgreSQL (Relational schema modeling including polymorphic inheritance)
- **Authentication**: JWT (JSON Web Tokens) with automated token rotation and blacklisting capabilities.
- **Documentation**: OpenAPI 3.0 / Swagger UI natively integrated via `drf-spectacular`.

---

## Repository Structure

The monorepo is split into distinct environments to maintain scalable isolation:

```text
career-advisor/
├── backend/            # Core API, matching algorithms, and Django models
│   ├── apps/           # 13 isolated Domain Modules (users, profiles, careers, internships, etc.)
│   ├── config/         # Django core settings (.env, JWT configurations, URL routers)
│   └── core/           # Abstract classes, Audit Entities, Exceptions, and specific pagination
├── frontend/           # (Placeholder) React/Next.js client interface
└── docs/               # (Placeholder) Thesis LaTeX ERD diagrams and system architectures
```

---

## Getting Started

Follow these instructions to get the development environment running locally.

### 1. Prerequisites
- Python 3.12+
- PostgreSQL Server running (`career-advisor_db` created locally)
- Git

### 2. Installation & Setup

Clone the repository and jump into the backend core:
```bash
git clone https://github.com/andremugabo/career-advisor.git
cd career-advisor/backend
```

Create and activate a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate
```

Install backend dependencies:
```bash
pip install -r requirements.txt
```

### 3. Environment Configurations

A `.env` file is heavily strictly required to hide your `SECRET_KEY` and `DATABASE_URL`. Create one in the `backend/` root directory:

```env
# backend/.env 
SECRET_KEY="django-insecure-[YOUR-SUPER-SECRET-KEY]"
DATABASE_URL="postgres://postgres:123@localhost:5432/career-advisor_db"
```

### 4. Database Schema & Seeding

We employ fully managed Django Migrations alongside an enterprise seeder system to bootstrap the logic.

```bash
# Push the ERD models into PostgreSQL
python manage.py migrate

# Seed the database with mock test data (Users, Clusters, Advisors)
python manage.py seed
```

*Note: The seeder script creates an Admin (`admin@auca.rw`), an Advisor (`advisor@auca.rw`), and two interactive Students. The default password for all generated mock accounts is `password123`.*

### 5. Booting the Server

Run the development server locally:
```bash
python manage.py runserver
```

---

## API Documentation

This project utilizes `drf-spectacular` to autogenerate pristine API blueprints. Once your development server is running (`127.0.0.1:8000`), you can test the entire API visually before hooking up the frontend:

- **Swagger UI Interactive Dashboard**: [http://127.0.0.1:8000/api/docs/](http://127.0.0.1:8000/api/docs/) 
- **Raw OpenAPI Schema**: [http://127.0.0.1:8000/api/schema/](http://127.0.0.1:8000/api/schema/)

---

## Authentication

All API logic is protected by `IsAuthenticated` global checks. To interact with the system via Swagger or Insomnia/Postman:
1. Send a POST request mapping to `/api/token/` strictly sending a valid `email` and `password`.
2. Extract the `access` token.
3. Pass the token header in all subsequent requests:
   `Authorization: Bearer <your_access_token>`
