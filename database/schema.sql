-- Create database
CREATE DATABASE IF NOT EXISTS insight_info;
USE insight_info;

-- Websites table
CREATE TABLE websites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    domain VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY domain_idx (domain)
);

-- Visits table
CREATE TABLE visits (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    website_id INT NOT NULL,
    visitor_ip VARCHAR(45),
    visitor_hash VARCHAR(32),
    country VARCHAR(100),
    country_code CHAR(2),
    browser VARCHAR(100),
    browser_version VARCHAR(50),
    os VARCHAR(100),
    os_version VARCHAR(50),
    screen_resolution VARCHAR(20),
    referrer TEXT,
    search_query TEXT,
    page_url TEXT,
    visit_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_online BOOLEAN DEFAULT TRUE,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (website_id) REFERENCES websites(id),
    INDEX website_time_idx (website_id, visit_time),
    INDEX online_idx (is_online, last_activity)
);

-- Daily stats table
CREATE TABLE daily_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    website_id INT NOT NULL,
    visit_date DATE NOT NULL,
    visit_count INT DEFAULT 0,
    FOREIGN KEY (website_id) REFERENCES websites(id),
    UNIQUE KEY website_date_idx (website_id, visit_date)
);

-- Hourly stats table
CREATE TABLE hourly_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    website_id INT NOT NULL,
    visit_date DATE NOT NULL,
    hour TINYINT NOT NULL,
    visit_count INT DEFAULT 0,
    FOREIGN KEY (website_id) REFERENCES websites(id),
    UNIQUE KEY website_date_hour_idx (website_id, visit_date, hour)
);

-- Country stats table
CREATE TABLE country_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    website_id INT NOT NULL,
    country VARCHAR(100) NOT NULL,
    country_code CHAR(2) NOT NULL,
    visit_count INT DEFAULT 0,
    FOREIGN KEY (website_id) REFERENCES websites(id),
    UNIQUE KEY website_country_idx (website_id, country_code)
);

-- Browser stats table
CREATE TABLE browser_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    website_id INT NOT NULL,
    browser VARCHAR(100) NOT NULL,
    browser_version VARCHAR(50) NOT NULL,
    visit_count INT DEFAULT 0,
    FOREIGN KEY (website_id) REFERENCES websites(id),
    UNIQUE KEY website_browser_idx (website_id, browser, browser_version)
);

-- OS stats table
CREATE TABLE os_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    website_id INT NOT NULL,
    os VARCHAR(100) NOT NULL,
    os_version VARCHAR(50) NOT NULL,
    visit_count INT DEFAULT 0,
    FOREIGN KEY (website_id) REFERENCES websites(id),
    UNIQUE KEY website_os_idx (website_id, os, os_version)
);

-- Screen resolution stats table
CREATE TABLE resolution_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    website_id INT NOT NULL,
    screen_resolution VARCHAR(20) NOT NULL,
    visit_count INT DEFAULT 0,
    FOREIGN KEY (website_id) REFERENCES websites(id),
    UNIQUE KEY website_resolution_idx (website_id, screen_resolution)
);

-- Create triggers for real-time stats updates
DELIMITER //

CREATE TRIGGER after_visit_insert
AFTER INSERT ON visits
FOR EACH ROW
BEGIN
    -- Update daily stats
    INSERT INTO daily_stats (website_id, visit_date, visit_count)
    VALUES (NEW.website_id, DATE(NEW.visit_time), 1)
    ON DUPLICATE KEY UPDATE visit_count = visit_count + 1;
    
    -- Update hourly stats
    INSERT INTO hourly_stats (website_id, visit_date, hour, visit_count)
    VALUES (NEW.website_id, DATE(NEW.visit_time), HOUR(NEW.visit_time), 1)
    ON DUPLICATE KEY UPDATE visit_count = visit_count + 1;
    
    -- Update country stats
    IF NEW.country_code IS NOT NULL THEN
        INSERT INTO country_stats (website_id, country, country_code, visit_count)
        VALUES (NEW.website_id, NEW.country, NEW.country_code, 1)
        ON DUPLICATE KEY UPDATE visit_count = visit_count + 1;
    END IF;
    
    -- Update browser stats
    IF NEW.browser IS NOT NULL THEN
        INSERT INTO browser_stats (website_id, browser, browser_version, visit_count)
        VALUES (NEW.website_id, NEW.browser, NEW.browser_version, 1)
        ON DUPLICATE KEY UPDATE visit_count = visit_count + 1;
    END IF;
    
    -- Update OS stats
    IF NEW.os IS NOT NULL THEN
        INSERT INTO os_stats (website_id, os, os_version, visit_count)
        VALUES (NEW.website_id, NEW.os, NEW.os_version, 1)
        ON DUPLICATE KEY UPDATE visit_count = visit_count + 1;
    END IF;
    
    -- Update resolution stats
    IF NEW.screen_resolution IS NOT NULL THEN
        INSERT INTO resolution_stats (website_id, screen_resolution, visit_count)
        VALUES (NEW.website_id, NEW.screen_resolution, 1)
        ON DUPLICATE KEY UPDATE visit_count = visit_count + 1;
    END IF;
END //

DELIMITER ;
