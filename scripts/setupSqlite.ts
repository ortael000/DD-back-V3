import sqlite3 from "sqlite3";
import 'dotenv/config'; 

const dbPath = process.env.SQLITE_DB_FILE_PATH;

if (!dbPath) {
    throw new Error ("Eh bah non!")
    
}
const db = new sqlite3.Database(dbPath);
