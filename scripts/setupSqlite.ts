import sqlite3 from "sqlite3";
import 'dotenv/config'; 

const dbPath = process.env.SQLITE_DB_FILE_PATH;

if (!dbPath) {
    console.log("SQLITE_DB_FILE_PATH is not defined in env");
    throw new Error ("Eh bah non!")
    
}
const db = new sqlite3.Database(dbPath);

console.log("db was well set-up" + db);


