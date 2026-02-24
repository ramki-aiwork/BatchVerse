# BatchVerse MVP - Technical Specification

**Version:** 1.0  
**Date:** 2026-02-24  
**Author:** System Architect (Subagent)

## 1. Executive Summary
This document defines the technical architecture for the BatchVerse MVP, a 1-week sprint project to connect batchmates. The system utilizes a **React Native (Expo)** frontend and a serverless **Azure Functions** backend backed by **Azure SQL Database**. Authentication will be handled via a custom lightweight implementation over Azure SQL to minimize configuration overhead for the MVP.

---

## 2. Tech Stack Selection

### Frontend (Mobile App)
*   **Framework:** React Native with **Expo** (Managed Workflow) for rapid development and OTA updates.
*   **Navigation:** `react-navigation` (Stack & Tab combination).
*   **State Management:** `React Context API` (sufficient for MVP complexity) or `Zustand` (if simple global store needed).
*   **Networking:** `Axios` for API requests.
*   **UI Component Library:** `React Native Paper` or `Tamagui` (for fast, consistent UI components).
*   **Storage:** `expo-secure-store` (for storing Auth Tokens).

### Backend (API)
*   **Runtime:** Node.js (v18 or v20 LTS).
*   **Framework:** **Azure Functions** (HttpTrigger).
*   **ORM/Query Builder:** `mssql` (official Microsoft SQL Server client for Node.js) or `Knex.js` for easier query building.

### Database
*   **Engine:** **Azure SQL Database** (Serverless tier recommended for cost efficiency during dev).
*   **Auth:** Custom JWT-based authentication (simpler than configuring B2C for a 1-week MVP).

---

## 3. Database Schema (Azure SQL)

```sql
-- 1. Users Table
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(500) NOT NULL, -- BCrypt hash
    FullName NVARCHAR(100) NOT NULL,
    BatchYear INT NOT NULL,
    Bio NVARCHAR(MAX) NULL,
    PhotoURL NVARCHAR(500) NULL,
    IsAdmin BIT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

-- 2. Events Table
CREATE TABLE Events (
    EventID INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    EventDate DATETIME2 NOT NULL,
    Location NVARCHAR(200) NULL,
    CreatedBy INT NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (CreatedBy) REFERENCES Users(UserID)
);

-- 3. RSVPs Table (Join Table for User-Event relationship)
CREATE TABLE RSVPs (
    RSVPID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    EventID INT NOT NULL,
    Status NVARCHAR(20) NOT NULL CHECK (Status IN ('Yes', 'No')),
    RSVPDate DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (EventID) REFERENCES Events(EventID),
    CONSTRAINT UQ_User_Event UNIQUE (UserID, EventID) -- One RSVP per user per event
);
```

---

## 4. API Contract (Azure Functions)

All endpoints should be prefixed with `/api`.
**Auth Header:** `Authorization: Bearer <jwt_token>` (Required for all except Auth endpoints).

### A. Authentication
| Method | Endpoint | Description | Request Body | Response (Success) |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/auth/signup` | Register a new user | `{ "email": "...", "password": "...", "fullName": "...", "batchYear": 2024 }` | `{ "token": "jwt...", "user": { "id": 1, "fullName": "...", "isAdmin": false } }` |
| **POST** | `/auth/login` | Log in user | `{ "email": "...", "password": "..." }` | `{ "token": "jwt...", "user": { "id": 1, "fullName": "...", "isAdmin": false } }` |

### B. Directory & Profile
| Method | Endpoint | Description | Request Body | Response (Success) |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/users` | List all users (supports search) | Query Params: `?search=name_or_batch` | `[ { "id": 1, "fullName": "...", "batchYear": 2024, "photoUrl": "..." } ]` |
| **GET** | `/users/{id}` | Get specific user profile | N/A | `{ "id": 1, "fullName": "...", "bio": "...", "eventsAttending": [...] }` |
| **PUT** | `/users/me` | Update own profile | `{ "bio": "...", "photoUrl": "..." }` | `{ "success": true, "updatedUser": {...} }` |

### C. Events
| Method | Endpoint | Description | Request Body | Response (Success) |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/events` | List all upcoming events | N/A | `[ { "id": 101, "title": "Reunion", "date": "...", "rsvpCount": 15 } ]` |
| **GET** | `/events/{id}` | Get event details + RSVP status | N/A | `{ "id": 101, "title": "...", "myRsvp": "Yes" \| null, "attendees": [...] }` |
| **POST** | `/events` | **[Admin Only]** Create Event | `{ "title": "...", "description": "...", "date": "...", "location": "..." }` | `{ "id": 102, "message": "Event created" }` |
| **POST** | `/events/{id}/rsvp` | RSVP to an event | `{ "status": "Yes" \| "No" }` | `{ "success": true, "status": "Yes" }` |

---

## 5. Implementation Notes for Developers

### Database Setup
1.  Create Azure SQL Server & Database via Azure Portal.
2.  Allow "Allow Azure services and resources to access this server" in firewall settings.
3.  Run the SQL script provided in Section 3 to seed the schema.

### Backend (Azure Functions)
*   Use `npm install mssql jsonwebtoken bcryptjs`.
*   Store connection string in `local.settings.json` (for dev) and App Settings (for prod).
*   Create a shared `middleware/auth.js` helper to validate JWTs and extract `userId` / `isAdmin` from the token before processing requests.

### Frontend (React Native)
*   **Screens:**
    *   **AuthStack:** LoginScreen, SignupScreen.
    *   **AppTabs:**
        *   **Directory:** UserList (FlatList + SearchBar).
        *   **Events:** EventList, EventDetail (with RSVP button).
        *   **Profile:** MyProfile (Editable).
*   **Admin Features:** Hide the "Create Event" button/FAB unless `user.isAdmin === true`.

