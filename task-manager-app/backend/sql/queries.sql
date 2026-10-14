-- DAY 21: DATABASE BASICS (Tables, Columns, Primary/Foreign Keys, Relationships)

-- Create a Categories table first (to demonstrate relationships)
CREATE TABLE Categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

-- Create a Tasks table with a Foreign Key linking to Categories
CREATE TABLE Tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    categoryId INTEGER,
    FOREIGN KEY (categoryId) REFERENCES Categories(id)
);

-- DAY 22: SQL (INSERT, SELECT, WHERE, ORDER BY, UPDATE, DELETE, JOIN basics)

-- 1. INSERT: Add initial data into your tables
INSERT INTO Categories (name) VALUES ('Work'), ('Personal');

INSERT INTO Tasks (title, description, categoryId) 
VALUES 
    ('Setup Prisma', 'Install Prisma for Day 23', 1),
    ('Buy groceries', 'Get milk and eggs', 2),
    ('Write SQL', 'Practice JOIN basics', 1);

-- 2. SELECT & WHERE: Read specific data
SELECT * FROM Tasks;
SELECT title, status FROM Tasks WHERE status = 'pending';

-- 3. ORDER BY: Sort your data
SELECT * FROM Tasks ORDER BY title ASC;

-- 4. UPDATE: Modify an existing record
UPDATE Tasks 
SET status = 'completed' 
WHERE title = 'Buy groceries';

-- 5. JOIN: Combine data from both tables using the Foreign Key
SELECT Tasks.title, Tasks.status, Categories.name AS category_name
FROM Tasks
JOIN Categories ON Tasks.categoryId = Categories.id;

-- 6. DELETE: Remove a record
DELETE FROM Tasks WHERE id = 3;