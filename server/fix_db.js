import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "crm.db");

async function fixDb() {
  console.log("🛠 Начало исправления базы данных...");
  
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });

  try {
    // Удаляем старую таблицу, чтобы создать новую с правильной структурой
    // ВНИМАНИЕ: Это удалит демо-записи, если они были
    await db.exec(`DROP TABLE IF EXISTS bookings;`);
    console.log("✅ Старая таблица bookings удалена.");

    await db.exec(`
      CREATE TABLE bookings (
        id TEXT PRIMARY KEY,
        contract_id TEXT,
        cottage_id TEXT,
        property TEXT,
        client_name TEXT,
        client_phone TEXT,
        checkin_at TEXT,
        checkout_at TEXT,
        check_in_hour INTEGER,
        check_out_hour INTEGER,
        guest_count INTEGER DEFAULT 1,
        status TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contract_id) REFERENCES contracts(id)
      );
    `);
    console.log("✅ Новая таблица bookings создана с правильной структурой.");

    console.log("🚀 База данных готова к работе!");
  } catch (error) {
    console.error("❌ Ошибка при исправлении:", error.message);
  } finally {
    await db.close();
  }
}

fixDb();
