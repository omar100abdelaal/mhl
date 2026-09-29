import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

const isDev = !app.isPackaged
const dbPath = isDev 
  ? join(__dirname, '../../data/database.sqlite')
  : join(app.getPath('userData'), 'database.sqlite')

// Ensure directory exists
const dbDir = join(dbPath, '..')
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true })
}

const db = new Database(dbPath)

// Initialize schema
export function initDb(): void {
  db.exec('PRAGMA foreign_keys = ON;')
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      image TEXT
    );

    CREATE TABLE IF NOT EXISTS subcategories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      image TEXT,
      category_id INTEGER,
      FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER DEFAULT 0,
      size TEXT,
      image TEXT,
      category_id INTEGER,
      subcategory_id INTEGER,
      FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE,
      FOREIGN KEY (subcategory_id) REFERENCES subcategories (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS receipts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total REAL NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS receipt_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receipt_id INTEGER,
      product_id INTEGER,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (receipt_id) REFERENCES receipts (id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL
    );
  `)
}

export function resetDb(): void {
  db.exec('PRAGMA foreign_keys = OFF;')
  db.exec('DROP TABLE IF EXISTS receipt_items;')
  db.exec('DROP TABLE IF EXISTS receipts;')
  db.exec('DROP TABLE IF EXISTS products;')
  db.exec('DROP TABLE IF EXISTS subcategories;')
  db.exec('DROP TABLE IF EXISTS categories;')
  db.exec('PRAGMA foreign_keys = ON;')
  initDb()
}

export default db
