# ✈️ Reporting CAMO

<p align="center">
  <img src="https://img.shields.io/badge/Aviation-CAMO%20Management-blue" alt="Aviation CAMO Management" />
  <img src="https://img.shields.io/badge/Backend-Spring%20Boot-brightgreen" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/Frontend-React-61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-336791" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Status-In%20Development-orange" alt="In Development" />
</p>

## Overview

**Reporting CAMO** is a full-stack aviation management and reporting application designed to facilitate the monitoring and management of aircraft operations, technical activities, and maintenance-related information.

The platform provides a centralized interface for managing aviation data, monitoring operational activities, and generating useful insights through interactive dashboards and reporting tools.

## Features

- Secure authentication and role-based access control
- Employee and user management
- Aircraft and flight data management
- Technical defect tracking
- Maintenance activity monitoring
- Interactive dashboards and data visualization
- Operational statistics and reporting
- Excel data export

## Technologies

**Backend**
- Java 17
- Spring Boot
- Spring Security
- Spring Data JPA / Hibernate
- JWT Authentication
- Maven

**Frontend**
- React 19
- Vite
- Tailwind CSS
- Axios
- React Router
- Recharts

**Database & Tools**
- PostgreSQL
- Flyway
- Git & GitHub

## Project Structure

```text
Reporting-camo/
│
├── src/
│   └── main/
│       ├── java/
│       │   └── net/othmane/reportingcamo/
│       │       ├── config/
│       │       ├── controller/
│       │       ├── dto/
│       │       ├── entity/
│       │       ├── repository/
│       │       ├── security/
│       │       └── service/
│       │
│       └── resources/
│           ├── application.yml
│           └── db/
│               └── migration/
│
├── aviation-frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── .env.example
│
├── pom.xml
├── mvnw
├── mvnw.cmd
└── README.md
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/OTHM341/Reporting-camo.git
```

### 2. Navigate to the project

```bash
cd Reporting-camo
```

### 3. Configure the database

Create a PostgreSQL database and configure the required environment variables for the backend.

### 4. Run the Backend

**Windows:**

```powershell
.\mvnw.cmd spring-boot:run
```

### 5. Run the Frontend

```bash
cd aviation-frontend
npm install
npm run dev
```

## Future Improvements

- Advanced aviation analytics and reporting
- Enhanced maintenance planning
- Additional operational dashboards
- Improved data visualization
- Expanded aircraft reliability monitoring

## Author

**Othmane Moutaouakil**

Computer Engineering Graduate | Full-Stack Developer

GitHub: [@OTHM341](https://github.com/OTHM341)

---

<p align="center">
  <sub>Developed by Othmane Moutaouakil</sub>
</p>
