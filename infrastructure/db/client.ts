import path from 'path';
import fs from 'fs';
import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';

const DB_PATH = path.join(process.cwd(), 'beardbuddy.db');
const SQL_PATH = path.join(process.cwd(), 'infrastructure', 'db', 'startup.sql');

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (db) return db;

  db = await open({ filename: DB_PATH, driver: sqlite3.Database });
  await db.exec('PRAGMA foreign_keys = ON;');

  const sql = fs.readFileSync(SQL_PATH, 'utf-8');
  await db.exec(sql);

  return db;
}
