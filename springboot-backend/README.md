# Digital OD Permission System — Spring Boot Backend

> ⚠️ **Standalone demo backend — runs on port 9090.**
> Does NOT affect the existing Node.js backend (port 5000) or React frontend (port 5173).
> No existing files were modified.

---

## Tech Stack

| Layer        | Technology                     |
|--------------|-------------------------------|
| Language     | Java 17                        |
| Framework    | Spring Boot 3.2.0              |
| Build Tool   | Maven                          |
| Security     | Spring Security + JWT (JJWT)   |
| Database     | H2 (demo) / PostgreSQL (prod)  |
| ORM          | Spring Data JPA / Hibernate    |
| Utilities    | Lombok                         |

---

## Project Structure

```
springboot-backend/
├── pom.xml
├── README.md
└── src/
    ├── main/
    │   ├── java/com/example/odsystem/
    │   │   ├── OdSystemApplication.java
    │   │   ├── controller/
    │   │   │   ├── AuthController.java
    │   │   │   ├── OdRequestController.java
    │   │   │   ├── AdminController.java
    │   │   │   └── AdvisorController.java
    │   │   ├── service/
    │   │   │   ├── AuthService.java
    │   │   │   ├── OdRequestService.java
    │   │   │   ├── AdminService.java
    │   │   │   └── AdvisorService.java
    │   │   ├── model/
    │   │   │   ├── User.java
    │   │   │   ├── OdRequest.java
    │   │   │   ├── Approval.java
    │   │   │   ├── Document.java
    │   │   │   ├── Department.java
    │   │   │   └── Warning.java
    │   │   ├── repository/
    │   │   │   ├── UserRepository.java
    │   │   │   ├── OdRequestRepository.java
    │   │   │   ├── ApprovalRepository.java
    │   │   │   ├── DocumentRepository.java
    │   │   │   ├── DepartmentRepository.java
    │   │   │   └── WarningRepository.java
    │   │   ├── dto/
    │   │   │   ├── RegisterRequest.java
    │   │   │   ├── LoginRequest.java
    │   │   │   ├── AuthResponse.java
    │   │   │   ├── UpdateProfileRequest.java
    │   │   │   ├── OdRequestDto.java
    │   │   │   ├── ApprovalActionRequest.java
    │   │   │   ├── DashboardStatsResponse.java
    │   │   │   └── WarningRequest.java
    │   │   ├── security/
    │   │   │   ├── JwtUtil.java
    │   │   │   ├── JwtAuthFilter.java
    │   │   │   └── SecurityConfig.java
    │   │   └── exception/
    │   │       ├── GlobalExceptionHandler.java
    │   │       ├── ResourceNotFoundException.java
    │   │       ├── BadRequestException.java
    │   │       └── UnauthorizedException.java
    │   └── resources/
    │       └── application.properties
    └── test/
        └── java/com/example/odsystem/
            └── OdSystemApplicationTests.java
```

---

## Running the Application

```bash
cd springboot-backend
mvn clean install
mvn spring-boot:run
```

Server starts at: **http://localhost:9090**
H2 Console: **http://localhost:9090/h2-console**

---

## Features Implemented

### 1. Authentication (`/api/auth`)
| Method | Endpoint           | Role      | Description                        |
|--------|--------------------|-----------|------------------------------------|
| POST   | `/register`        | Public    | Register Student or Faculty        |
| POST   | `/login`           | Public    | Login, returns JWT token           |
| GET    | `/profile`         | All       | Get current user profile           |
| PUT    | `/profile`         | All       | Update name, email, password, photo|

### 2. OD Requests (`/api/od`)
| Method | Endpoint              | Role      | Description                              |
|--------|-----------------------|-----------|------------------------------------------|
| POST   | `/`                   | Student   | Submit new OD request with documents     |
| GET    | `/my-requests`        | Student   | Get student's own OD requests            |
| GET    | `/faculty-requests`   | Faculty   | Get OD requests assigned to faculty      |
| PUT    | `/{id}/action`        | Faculty   | Approve or reject a request              |
| PUT    | `/{id}/proof`         | Student   | Upload proof after OD completion         |
| GET    | `/all`                | Admin     | Get all requests (filter by dept/status) |

### 3. Admin (`/api/admin`)
| Method | Endpoint                  | Description                          |
|--------|---------------------------|--------------------------------------|
| GET    | `/users`                  | List all users (filter by role/dept) |
| DELETE | `/users/{id}`             | Delete a user                        |
| PUT    | `/users/{id}/block`       | Block a student                      |
| PUT    | `/users/{id}/unblock`     | Unblock a student (resets warnings)  |
| GET    | `/reports`                | View all advisor reports             |
| GET    | `/stats`                  | Dashboard analytics                  |
| GET    | `/mentors/{department}`   | Get mentors for a department         |
| GET    | `/advisors/{dept}/{year}` | Get class advisors for dept + year   |

### 4. Advisor Proof Monitoring (`/api/advisor`)
| Method | Endpoint                    | Description                                  |
|--------|-----------------------------|----------------------------------------------|
| GET    | `/proof-submissions`        | View all approved ODs with proof status      |
| POST   | `/warn/{odRequestId}`       | Send warning to student (max 3)              |
| POST   | `/report/{odRequestId}`     | Report student to admin (after 3 warnings)   |
| GET    | `/my-warnings`              | Student fetches their own warnings/reports   |

---

## Approval Flow

```
Student submits OD
       ↓
   Mentor (step 1)
       ↓
Class Advisor (step 2)
       ↓
Innovation Head (step 3)
       ↓
    HOD (step 4)
       ↓
    CFI (step 5)  ← Final approval → OD Approved
```

- Any faculty can **reject** at any step
- **Approval** requires all previous steps to be approved first
- ClassAdvisor can act as **Mentor** if assigned as mentorId

---

## User Roles

| Role          | Permissions                                              |
|---------------|----------------------------------------------------------|
| Student       | Apply OD, view history, upload proof, view warnings      |
| Mentor        | Approve/reject OD requests assigned to them              |
| ClassAdvisor  | Approve/reject as mentor or advisor, warn/report students|
| InnovationHead| Approve/reject OD requests                              |
| HOD           | Approve/reject OD requests                              |
| CFI           | Final approval of OD requests                           |
| Admin         | Full access: users, stats, reports, block/unblock        |

---

## Warning & Report System

1. ClassAdvisor can send up to **3 warnings** to a student for non-submission of proof
2. After **3 warnings**, the **Report** button is enabled
3. Report is sent to Admin dashboard
4. Admin can **block** the student — blocked students cannot apply for OD
5. Admin can **unblock** the student (resets warning count to 0)
6. Warnings appear on the **Student Dashboard** as notifications

---

## Student OD Limit

- Each student can have a maximum of **10 approved ODs**
- The limit is tracked via `approvedODCount` on the User entity
- Blocked students cannot submit new OD requests

---

## Proof Submission

After an OD is fully approved and the event date has passed:
- Student uploads **Geo-tagged Photo** + **Participation Certificate**
- ClassAdvisor monitors submission status:
  - ⏳ Time left (before end date)
  - ❌ Not Submitted (after end date)
  - 🚨 Overdue (>30 days after end date)
  - ✅ Submitted

---

## Switching to PostgreSQL

In `application.properties`, comment out H2 config and uncomment:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/od_permission_system
spring.datasource.driver-class-name=org.postgresql.Driver
spring.datasource.username=postgres
spring.datasource.password=your_password
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
```
