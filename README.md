# 🚀 ShareX – Secure File Sharing Platform

## 👥 Team Structure

The team is divided into:

* Backend Core Development & Backend Feature Implementation<br>
Vishnu Sai Varshith Kaki - back-end<br>
Rohith Reddy Vaka - back-end<br>
* Frontend Foundation & Frontend Integration<br>
Bhoomika Mudi - front-end<br>
Harshini Sangem - front-end

All tasks are tracked using GitHub Issues and completed through Pull Requests following Agile workflow.

## 📌 Project Overview

**ShareX** is a file sharing web application that allows users to securely upload, store, and share files with others through generated links. The platform focuses on simplicity, speed, and a modern user experience.

The system is built using:

- ⚛️ **React** (Frontend)
- 🐹 **Go** (Backend REST API)
- 🐘 **PostgreSQL** (Database)

This project is developed as part of a Software Engineering course using an **Agile methodology across 4 sprints**.

---

## 🎯 Project Objective

The objective of ShareX is to design and implement a scalable, modular, and secure file-sharing system while applying:

- Agile development practices
- Clean architecture principles
- RESTful API design
- PostgreSQL database integration
- & Git workflow (Issues → Branches → Pull Requests → Code Reviews)

---

## 🏗 System Architecture

The project follows a **monorepo structure** with clear separation of concerns:

```

ShareX/
├── frontend/     → React application (User Interface)
├── backend/      → Go REST API
├── README.md

````

### 🔹 Frontend
- Built using Vite + React
- Uses React Router for navigation
- Communicates with backend via REST APIs
- Handles file upload and download UI

### 🔹 Backend
- Built using Go
- Implements RESTful APIs
- Generates secure file tokens
- Streams files efficiently
- Connects to PostgreSQL for persistent storage

### 🔹 Database (PostgreSQL)
Stores file metadata including:
- Unique token
- Filename
- File size
- File path
- Created timestamp

---

## 🔄 Agile Development Plan

The project will be developed across **4 Sprints**.

---

### 🟢 Sprint 1 – Foundation & MVP (Current Sprint)

**Planned Deliverables:**
- Backend project setup
- PostgreSQL integration
- Files table creation
- File upload endpoint
- Secure token generation
- Metadata storage in PostgreSQL
- File metadata retrieval endpoint
- File download endpoint
- Basic React frontend
- Working Upload → Share → Download flow

**Sprint Goal:**  
Deliver a functional Minimum Viable Product (MVP) demonstrating end-to-end file sharing.

---

### 🟡 Sprint 2 – Authentication & User Features
- User authentication (JWT)
- User table in PostgreSQL
- File ownership management
- “My Files” dashboard
- Delete / revoke links

---

### 🟠 Sprint 3 – Security & Enhancements
- File expiration logic
- Improved validation and error handling
- Logging improvements
- UI/UX enhancements
- Performance optimization

---

### 🔴 Sprint 4 – Deployment & Production Readiness
- Dockerization
- CI/CD setup
- Cloud deployment
- Monitoring & logging
- Final documentation

---

## 🧠 Design Principles

- Separation of concerns (Handler → Service → Repository → Database)
- Environment-based configuration
- Clean and modular structure
- Scalable architecture for future enhancements
- RESTful API best practices

---

## 🗄 Planned Database Schema (Sprint 1)

```sql
CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_path TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
````

---

## 🚀 Getting Started (To Be Updated After Sprint 1)

### Backend

```bash
cd backend
go run ./cmd/server
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```


---

## 📂 Current Status

Project initialized.
Sprint 1 development in progress.
PostgreSQL integration planned as part of MVP implementation.

## 🛠 Development Workflow

1. Feature defined as GitHub Issue
2. Issue assigned to team member
3. Feature branch created
4. Pull Request submitted
5. Code review performed
6. Merge to main branch
7. Sprint review & demo

---

## 📜 License

This project is developed for academic purposes as part of university coursework.

```
