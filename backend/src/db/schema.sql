CREATE DATABASE IF NOT EXISTS wound_tracker;

USE wound_tracker;

CREATE TABLE IF NOT EXISTS users(
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phoneNumber VARCHAR(10) NOT NULL,
    password_hashed VARCHAR(255) NOT NULL,
    profileImage VARCHAR(500),
    isActive BOOLEAN DEFAULT TRUE,
    date_of_birth DATE NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wounds(
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    wound_type VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wound_images(
    id INT AUTO_INCREMENT PRIMARY KEY,
    wound_id INT NOT NULL,
    image_url VARCHAR(500),
    uploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (wound_id)
        REFERENCES wounds(id)
        ON DELETE CASCADE
    
    
);

CREATE TABLE IF NOT EXISTS wound_analysis(
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_id INT NOT NULL,
    mask_url VARCHAR(500),
    dice_score DECIMAL(5,4),
    new_wound_area DECIMAL(10,2),
    new_healthy_area DECIMAL(10,2),
    previous_wound_area DECIMAL(10,2),
    previous_healthy_area DECIMAL(10,2),
    change_area DECIMAL(10,2),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (image_id)
        REFERENCES wound_images(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reportsHistory (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    note VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications(
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    wound_id INT NOT NULL,
    analysis_id INT,
    notification_type VARCHAR(100) NOT NULL,
    message VARCHAR(500) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    scheduledAt TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (wound_id)
        REFERENCES wounds(id)
        ON DELETE CASCADE,

    FOREIGN KEY (analysis_id)
        REFERENCES wound_analysis(id)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS password_reset_otps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    expiresAt TIMESTAMP NOT NULL,
    isUsed BOOLEAN DEFAULT FALSE,
    attempts INT DEFAULT 0,
    sentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE        
);