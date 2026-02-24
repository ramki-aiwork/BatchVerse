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
