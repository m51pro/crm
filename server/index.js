import express from "express";
import cors from "cors";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import path from "path";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, "crm.db");

// Инициализация базы данных и таблиц
async function initDb() {
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      client_type TEXT DEFAULT 'individual',
      first_name TEXT,
      last_name TEXT,
      middle_name TEXT,
      org_name TEXT,
      phone TEXT,
      contact_phone TEXT,
      email TEXT,
      contact_email TEXT,
      inn TEXT,
      passport_series TEXT,
      passport_number TEXT,
      is_blacklisted INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contracts (
      id TEXT PRIMARY KEY,
      contract_number TEXT,
      contract_date TEXT,
      client_id TEXT,
      client_name TEXT,
      client_phone TEXT,
      property TEXT,
      cottage_id TEXT,
      check_in_date TEXT,
      check_in_hour INTEGER,
      check_out_date TEXT,
      check_out_hour INTEGER,
      checkin_at TEXT,
      checkout_at TEXT,
      bath_included INTEGER DEFAULT 0,
      bath_date TEXT,
      bath_time_from TEXT,
      bath_time_to TEXT,
      days INTEGER,
      rent_price NUMERIC,
      prepayment NUMERIC,
      total NUMERIC,
      payment_date TEXT,
      payment_amount NUMERIC,
      extra_info TEXT,
      status TEXT,
      next_reminder_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id)
    );

    CREATE TABLE IF NOT EXISTS bookings (
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

    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      title TEXT,
      target_property TEXT,
      client_type TEXT,
      html_content TEXT,
      settings TEXT,
      versions_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    INSERT OR IGNORE INTO settings (key, value) VALUES ('contract_prefix', 'ДГ');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('contract_start_num', '221');
  `);
  
  // Safe migration to add new columns to contracts table
  try {
    const contractCols = [
      "next_reminder_at DATETIME",
      "cottage_included INTEGER DEFAULT 1",
      "sauna_included INTEGER DEFAULT 0",
      "hot_tub_included INTEGER DEFAULT 0",
      "sauna_date TEXT", "sauna_time_from TEXT", "sauna_time_to TEXT", 
      "sauna_price NUMERIC", "sauna_guests INTEGER",
      "hot_tub_date TEXT", "hot_tub_time_from TEXT", "hot_tub_time_to TEXT", 
      "hot_tub_price NUMERIC", "hot_tub_guests INTEGER"
    ];
    for (const col of contractCols) {
      try {
        await db.exec(`ALTER TABLE contracts ADD COLUMN ${col};`);
        console.log(`Migration: Added ${col.split(' ')[0]} to contracts table.`);
      } catch (e) {
        if (!e.message.includes("duplicate column name")) console.error("Migration warning:", e.message);
      }
    }
  } catch (e) {
    console.error("Migration error contracts:", e.message);
  }

  // Safe migration to add new columns to clients table
  try {
    const newColumns = [
      "birth_date TEXT", "passport_issued_date TEXT", "passport_issued_by TEXT", "registration_address TEXT",
      "kpp TEXT", "ogrn TEXT", "legal_address TEXT", "contact_person TEXT", 
      "bank_name TEXT", "settlement_account TEXT", "corr_account TEXT", "bik TEXT", "notes TEXT"
    ];
    for (const col of newColumns) {
      try {
        await db.exec(`ALTER TABLE clients ADD COLUMN ${col};`);
        console.log(`Migration: Added ${col.split(' ')[0]} to clients table.`);
      } catch (e) {
        if (!e.message.includes("duplicate column name")) console.error(e.message);
      }
    }
  } catch (e) {
    console.error("Migration error:", e.message);
  }

  return db;
}

let db;
initDb().then((database) => {
  db = database;
  console.log("Локальная SQLite база инициализирована:", DB_PATH);
});

// --- API Роуты ---

app.get("/api", (req, res) => {
  res.json({ message: "CRM API is running", status: "ok" });
});

// 1. Клиенты
app.get("/api/clients", async (req, res) => {
  try {
    const clients = await db.all("SELECT * FROM clients ORDER BY created_at DESC");
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/clients", async (req, res) => {
  try {
    const data = req.body;
    const id = data.id || randomUUID();
    
    await db.run(
      `INSERT INTO clients (
        id, client_type, first_name, last_name, middle_name, org_name, 
        phone, contact_phone, email, contact_email, inn, passport_series, 
        passport_number, is_blacklisted, birth_date, passport_issued_date,
        passport_issued_by, registration_address, kpp, ogrn, legal_address,
        contact_person, bank_name, settlement_account, corr_account, bik, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, data.client_type, data.first_name, data.last_name, data.middle_name, data.org_name,
        data.phone, data.contact_phone, data.email, data.contact_email, data.inn, data.passport_series,
        data.passport_number, data.is_blacklisted ? 1 : 0, data.birth_date, data.passport_issued_date,
        data.passport_issued_by, data.registration_address, data.kpp, data.ogrn, data.legal_address,
        data.contact_person, data.bank_name, data.settlement_account, data.corr_account, data.bik, data.notes
      ]
    );

    const newClient = await db.get("SELECT * FROM clients WHERE id = ?", [id]);
    res.json(newClient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/clients/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    await db.run(
      `UPDATE clients SET 
        client_type = ?, first_name = ?, last_name = ?, middle_name = ?, org_name = ?, 
        phone = ?, contact_phone = ?, email = ?, contact_email = ?, inn = ?, passport_series = ?, 
        passport_number = ?, is_blacklisted = ?, birth_date = ?, passport_issued_date = ?,
        passport_issued_by = ?, registration_address = ?, kpp = ?, ogrn = ?, legal_address = ?,
        contact_person = ?, bank_name = ?, settlement_account = ?, corr_account = ?, bik = ?, notes = ?
      WHERE id = ?`,
      [
        data.client_type, data.first_name, data.last_name, data.middle_name, data.org_name,
        data.phone, data.contact_phone, data.email, data.contact_email, data.inn, data.passport_series,
        data.passport_number, data.is_blacklisted ? 1 : 0, data.birth_date, data.passport_issued_date,
        data.passport_issued_by, data.registration_address, data.kpp, data.ogrn, data.legal_address,
        data.contact_person, data.bank_name, data.settlement_account, data.corr_account, data.bik, data.notes,
        id
      ]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/clients/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.run("DELETE FROM clients WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (error) {
    // В случае наличия связанных записей sqlite выбросит FOREIGN KEY constraint failed
    if (error.message.includes("FOREIGN KEY")) {
      res.status(400).json({ error: "Невозможно удалить клиента, у него есть договоры." });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// 2. Договоры
app.get("/api/contracts", async (req, res) => {
  try {
    const contracts = await db.all("SELECT * FROM contracts ORDER BY created_at DESC");
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/contracts", async (req, res) => {
  try {
    const data = req.body;
    const id = data.id || randomUUID();
    
    // Генерируем номер договора, если не передан
    let contract_number = data.contract_number;
    if (!contract_number) {
      const year = new Date().getFullYear();
      const row = await db.get("SELECT COUNT(*) as count FROM contracts");
      const nextNum = String(row.count + 1).padStart(3, '0');
      contract_number = `${year}-${nextNum}`;
    }

    await db.run(
      `INSERT INTO contracts (
        id, contract_number, contract_date, client_id, client_name, client_phone, 
        property, cottage_id, checkin_at, checkout_at, 
        bath_included, bath_date, bath_time_from, bath_time_to, 
        days, rent_price, prepayment, total, payment_date, payment_amount, 
        extra_info, status,
        cottage_included, sauna_included, hot_tub_included,
        sauna_date, sauna_time_from, sauna_time_to, sauna_price, sauna_guests,
        hot_tub_date, hot_tub_time_from, hot_tub_time_to, hot_tub_price, hot_tub_guests
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, contract_number, data.contract_date, data.client_id, data.client_name, data.client_phone,
        data.property, data.cottage_id, data.checkin_at, data.checkout_at,
        data.bath_included ? 1 : 0, data.bath_date, data.bath_time_from, data.bath_time_to,
        data.days, data.rent_price, data.prepayment, data.total, data.payment_date, data.payment_amount,
        data.extra_info, data.status,
        data.cottage_included !== false ? 1 : 0, data.sauna_included ? 1 : 0, data.hot_tub_included ? 1 : 0,
        data.sauna_date, data.sauna_time_from, data.sauna_time_to, data.sauna_price, data.sauna_guests,
        data.hot_tub_date, data.hot_tub_time_from, data.hot_tub_time_to, data.hot_tub_price, data.hot_tub_guests
      ]
    );

    // Обновляем шахматку
    await db.run("DELETE FROM bookings WHERE contract_id = ?", [id]);
    if (data.status !== "cancelled") {
      const statusMap = { 'paid': 'contract_paid', 'partial_paid': 'contract_signed', 'not_paid': 'contract_signed', 'pre_booking': 'pre_booking' };
      const finalStatus = statusMap[data.status] || data.status;

      const insertBooking = async (prop, cot_id, checkin, checkout, guests) => {
        if (!checkin || !checkout) return;
        
        let inHour = null;
        let outHour = null;
        try {
          if (checkin.includes('T')) inHour = parseInt(checkin.split('T')[1].split(':')[0], 10);
          if (checkout.includes('T')) outHour = parseInt(checkout.split('T')[1].split(':')[0], 10);
        } catch(e) {}

        await db.run(
          `INSERT INTO bookings (id, contract_id, cottage_id, property, client_name, client_phone, checkin_at, checkout_at, check_in_hour, check_out_hour, guest_count, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [randomUUID(), id, cot_id, prop, data.client_name, data.client_phone, checkin, checkout, inHour, outHour, guests || 1, finalStatus]
        );
      };

      if (data.property === "chunga_changa") {
        if (data.cottage_included !== false && data.cottage_id) {
          await insertBooking("chunga", data.cottage_id, data.checkin_at, data.checkout_at, data.guest_count);
        }
      } else if (data.property === "golubaya_bukhta") {
        if (data.cottage_included !== false && data.cottage_id) {
          await insertBooking("gb_cottages", data.cottage_id, data.checkin_at, data.checkout_at, data.guest_count);
        }
        if (data.sauna_included) {
          const s_in = data.sauna_date && data.sauna_time_from ? `${data.sauna_date}T${data.sauna_time_from}:00` : null;
          const s_out = data.sauna_date && data.sauna_time_to ? `${data.sauna_date}T${data.sauna_time_to}:00` : null;
          await insertBooking("gb_banya", "gb-banya", s_in, s_out, data.sauna_guests);
        }
        if (data.hot_tub_included) {
          const h_in = data.hot_tub_date && data.hot_tub_time_from ? `${data.hot_tub_date}T${data.hot_tub_time_from}:00` : null;
          const h_out = data.hot_tub_date && data.hot_tub_time_to ? `${data.hot_tub_date}T${data.hot_tub_time_to}:00` : null;
          await insertBooking("gb_banya", "gb-furako", h_in, h_out, data.hot_tub_guests);
        }
      }
    }

    const newContract = await db.get("SELECT * FROM contracts WHERE id = ?", [id]);
    res.json(newContract);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/contracts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    await db.run(
      `UPDATE contracts SET 
        contract_date = ?, client_id = ?, client_name = ?, client_phone = ?, 
        property = ?, cottage_id = ?, checkin_at = ?, checkout_at = ?, 
        bath_included = ?, bath_date = ?, bath_time_from = ?, bath_time_to = ?, 
        days = ?, rent_price = ?, prepayment = ?, total = ?, payment_date = ?, payment_amount = ?, 
        extra_info = ?, status = ?,
        cottage_included = ?, sauna_included = ?, hot_tub_included = ?,
        sauna_date = ?, sauna_time_from = ?, sauna_time_to = ?, sauna_price = ?, sauna_guests = ?,
        hot_tub_date = ?, hot_tub_time_from = ?, hot_tub_time_to = ?, hot_tub_price = ?, hot_tub_guests = ?
      WHERE id = ?`,
      [
        data.contract_date, data.client_id, data.client_name, data.client_phone,
        data.property, data.cottage_id, data.checkin_at, data.checkout_at,
        data.bath_included ? 1 : 0, data.bath_date, data.bath_time_from, data.bath_time_to,
        data.days, data.rent_price, data.prepayment, data.total, data.payment_date, data.payment_amount,
        data.extra_info, data.status,
        data.cottage_included !== false ? 1 : 0, data.sauna_included ? 1 : 0, data.hot_tub_included ? 1 : 0,
        data.sauna_date, data.sauna_time_from, data.sauna_time_to, data.sauna_price, data.sauna_guests,
        data.hot_tub_date, data.hot_tub_time_from, data.hot_tub_time_to, data.hot_tub_price, data.hot_tub_guests,
        id
      ]
    );

    // Обновляем шахматку
    await db.run("DELETE FROM bookings WHERE contract_id = ?", [id]);
    if (data.status !== "cancelled") {
      const statusMap = { 'paid': 'contract_paid', 'partial_paid': 'contract_signed', 'not_paid': 'contract_signed', 'pre_booking': 'pre_booking' };
      const finalStatus = statusMap[data.status] || data.status;

      const insertBooking = async (prop, cot_id, checkin, checkout, guests) => {
        if (!checkin || !checkout) return;
        
        let inHour = null;
        let outHour = null;
        try {
          if (checkin.includes('T')) inHour = parseInt(checkin.split('T')[1].split(':')[0], 10);
          if (checkout.includes('T')) outHour = parseInt(checkout.split('T')[1].split(':')[0], 10);
        } catch(e) {}

        await db.run(
          `INSERT INTO bookings (id, contract_id, cottage_id, property, client_name, client_phone, checkin_at, checkout_at, check_in_hour, check_out_hour, guest_count, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [randomUUID(), id, cot_id, prop, data.client_name, data.client_phone, checkin, checkout, inHour, outHour, guests || 1, finalStatus]
        );
      };

      if (data.property === "chunga_changa") {
        if (data.cottage_included !== false && data.cottage_id) {
          await insertBooking("chunga", data.cottage_id, data.checkin_at, data.checkout_at, data.guest_count);
        }
      } else if (data.property === "golubaya_bukhta") {
        if (data.cottage_included !== false && data.cottage_id) {
          await insertBooking("gb_cottages", data.cottage_id, data.checkin_at, data.checkout_at, data.guest_count);
        }
        if (data.sauna_included) {
          const s_in = data.sauna_date && data.sauna_time_from ? `${data.sauna_date}T${data.sauna_time_from}:00` : null;
          const s_out = data.sauna_date && data.sauna_time_to ? `${data.sauna_date}T${data.sauna_time_to}:00` : null;
          await insertBooking("gb_banya", "gb-banya", s_in, s_out, data.sauna_guests);
        }
        if (data.hot_tub_included) {
          const h_in = data.hot_tub_date && data.hot_tub_time_from ? `${data.hot_tub_date}T${data.hot_tub_time_from}:00` : null;
          const h_out = data.hot_tub_date && data.hot_tub_time_to ? `${data.hot_tub_date}T${data.hot_tub_time_to}:00` : null;
          await insertBooking("gb_banya", "gb-furako", h_in, h_out, data.hot_tub_guests);
        }
      }
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Забираем свободный номер договора
app.get("/api/contracts/next-number", async (req, res) => {
  try {
    const prefixRow = await db.get("SELECT value FROM settings WHERE key = 'contract_prefix'");
    const startNumRow = await db.get("SELECT value FROM settings WHERE key = 'contract_start_num'");
    
    const prefix = prefixRow ? prefixRow.value : "ДГ";
    const startNum = startNumRow ? parseInt(startNumRow.value) : 1;
    
    const countRow = await db.get("SELECT COUNT(*) as count FROM contracts");
    const nextNum = startNum + countRow.count;
    
    res.json({ next_number: `${prefix}${nextNum}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Настройки
app.get("/api/settings", async (req, res) => {
  try {
    const rows = await db.all("SELECT * FROM settings");
    const settings = rows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/settings", async (req, res) => {
  try {
    const settings = req.body;
    for (const [key, value] of Object.entries(settings)) {
      await db.run("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", [key, String(value)]);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Просроченные договоры (Orange Alert)
app.get("/api/contracts/overdue", async (req, res) => {
  try {
    const overdue = await db.all(`
      SELECT * FROM contracts 
      WHERE status = 'signed' 
      AND (julianday('now') - julianday(created_at)) > 1
      AND (next_reminder_at IS NULL OR datetime(next_reminder_at) <= datetime('now'))
      ORDER BY created_at ASC
    `);
    res.json(overdue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Шахматка (Бронирования)
app.get("/api/bookings", async (req, res) => {
  try {
    const { property, date } = req.query;
    let query = "SELECT * FROM bookings WHERE 1=1";
    const params = [];

    if (property) {
      query += " AND property = ?";
      params.push(property);
    }

    const bookings = await db.all(query, params);
    
    // Map database snake_case columns to frontend camelCase expectations
    const mappedBookings = bookings.map(b => ({
      ...b,
      cottageId: b.cottage_id,
      clientName: b.client_name,
      phone: b.client_phone,
      checkInDate: b.checkin_at,
      checkOutDate: b.checkout_at,
      checkInHour: b.check_in_hour,
      checkOutHour: b.check_out_hour,
      guestCount: b.guest_count,
      isDaily: b.property === 'gb_cottages'
    }));

    res.json(mappedBookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/bookings", async (req, res) => {
  try {
    const data = req.body;
    const id = data.id || randomUUID();
    
    await db.run(
      `INSERT INTO bookings (
        id, cottage_id, property, client_name, client_phone, 
        checkin_at, checkout_at, check_in_hour, check_out_hour, guest_count, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, data.cottage_id, data.property, data.client_name, data.client_phone,
        data.checkin_at, data.checkout_at, data.check_in_hour, data.check_out_hour, data.guest_count || 1, data.status
      ]
    );

    const newBooking = await db.get("SELECT * FROM bookings WHERE id = ?", [id]);
    res.json(newBooking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/bookings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const cottageId = data.cottageId || data.cottage_id;
    let property = data.property;

    // Автоматический пересчет property при смене cottage_id
    if (cottageId) {
      if (cottageId.startsWith("cc")) property = "chunga";
      else if (cottageId.startsWith("gb-banya") || cottageId.startsWith("gb-furako")) property = "gb_banya";
      else if (cottageId.startsWith("gb")) property = "gb_cottages";
    }

    await db.run(
      `UPDATE bookings SET 
        client_name = ?, client_phone = ?, guest_count = ?, status = ?,
        checkin_at = ?, checkout_at = ?, check_in_hour = ?, check_out_hour = ?,
        cottage_id = ?, property = ?
      WHERE id = ?`,
      [
        data.client_name, 
        data.phone || data.client_phone, 
        data.guest_count || data.guestCount, 
        data.status,
        data.checkin_at || data.checkInDate,
        data.checkout_at || data.checkOutDate,
        data.check_in_hour !== undefined ? data.check_in_hour : data.checkInHour,
        data.check_out_hour !== undefined ? data.check_out_hour : data.checkOutHour,
        cottageId,
        property,
        id
      ]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/bookings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.run("DELETE FROM bookings WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Напомнить позже (изменить next_reminder_at)
app.patch("/api/contracts/:id/reminder", async (req, res) => {
  try {
    const { id } = req.params;
    const { next_reminder_at } = req.body;
    
    await db.run(
      "UPDATE contracts SET next_reminder_at = ? WHERE id = ?",
      [next_reminder_at, id]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// TEMPLATES API
// ============================================

app.get("/api/templates", async (req, res) => {
  try {
    const templates = await db.all("SELECT id, title, target_property, client_type, updated_at FROM templates ORDER BY updated_at DESC");
    res.json({ success: true, data: templates });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/templates/:id", async (req, res) => {
  try {
    const template = await db.get("SELECT * FROM templates WHERE id = ?", [req.params.id]);
    if (!template) return res.status(404).json({ error: "Template not found" });
    
    template.settings = template.settings ? JSON.parse(template.settings) : {};
    template.versions = template.versions_json ? JSON.parse(template.versions_json) : [];
    
    res.json({ success: true, data: template });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/templates", async (req, res) => {
  try {
    const { id, title, target_property, client_type, html_content, settings } = req.body;
    const now = new Date().toISOString();
    const templateId = id || randomUUID();
    
    const existing = await db.get("SELECT * FROM templates WHERE id = ?", [templateId]);
    let versions = existing?.versions_json ? JSON.parse(existing.versions_json) : [];
    
    if (existing) {
       versions.unshift({
          timestamp: existing.updated_at,
          title: existing.title,
          html_content: existing.html_content,
          settings: existing.settings
       });
       versions = versions.slice(0, 10); // Keep max 10 version history
    }
    
    if (existing) {
       await db.run(
         `UPDATE templates SET title = ?, target_property = ?, client_type = ?, html_content = ?, settings = ?, versions_json = ?, updated_at = ? WHERE id = ?`,
         [title, target_property || 'all', client_type || 'all', html_content, JSON.stringify(settings || {}), JSON.stringify(versions), now, templateId]
       );
    } else {
       await db.run(
         `INSERT INTO templates (id, title, target_property, client_type, html_content, settings, versions_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
         [templateId, title, target_property || 'all', client_type || 'all', html_content, JSON.stringify(settings || {}), JSON.stringify(versions), now, now]
       );
    }

    res.json({ success: true, id: templateId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
  console.log(`👉 API доступно по адресу http://localhost:${PORT}/api`);
});
