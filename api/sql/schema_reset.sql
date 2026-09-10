-- ============================================================
-- Blog-App schema RESET (use this if you already had old tables
-- from before Phase 1, e.g. a "posts" table missing the slug/
-- status/views columns).
--
-- WARNING: this deletes all existing users/posts/comments data.
-- Only run this in development.
--
-- Run:  mysql -u root -p < schema_reset.sql
-- ============================================================

USE blog;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS bookmarks;
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------
-- Now recreate everything fresh (same as schema.sql)
-- ---------------------------------------------------------

CREATE TABLE users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(50)  NOT NULL UNIQUE,
  email       VARCHAR(100) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  img         VARCHAR(255) DEFAULT NULL,
  bio         VARCHAR(500) DEFAULT NULL,
  role        ENUM('user','admin') NOT NULL DEFAULT 'user',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(50) NOT NULL UNIQUE,
  slug  VARCHAR(60) NOT NULL UNIQUE
);

INSERT INTO categories (name, slug) VALUES
  ('Art', 'art'), ('Science', 'science'), ('Technology', 'technology'),
  ('Cinema', 'cinema'), ('Design', 'design'), ('Food', 'food');

CREATE TABLE posts (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  uid         INT NOT NULL,
  cat_id      INT DEFAULT NULL,
  title       VARCHAR(255) NOT NULL,
  slug        VARCHAR(280) NOT NULL UNIQUE,
  `desc`      LONGTEXT NOT NULL,
  img         VARCHAR(255) DEFAULT NULL,
  status      ENUM('draft','published') NOT NULL DEFAULT 'draft',
  views       INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (uid) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (cat_id) REFERENCES categories(id) ON DELETE SET NULL,
  FULLTEXT KEY ft_title_desc (title, `desc`)
);

CREATE TABLE comments (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  post_id     INT NOT NULL,
  uid         INT NOT NULL,
  parent_id   INT DEFAULT NULL,
  content     TEXT NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (uid) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

CREATE TABLE likes (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  post_id     INT NOT NULL,
  uid         INT NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_like (post_id, uid),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (uid) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE bookmarks (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  post_id     INT NOT NULL,
  uid         INT NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_bookmark (post_id, uid),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (uid) REFERENCES users(id) ON DELETE CASCADE
);
