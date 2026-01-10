import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export function displayTables (db : sqlite3.Database, tableNames : string[]) {  //take in input an array of SQL instruction to execute in an asynchronous way
    
    const displayTable = (tableName : string) => {     // First we create a function that generate a promise to execute the sql statement and manage the promise resolution
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM "+ tableName, [], (err, rows) => {
                if (err) {
                    reject(err.message);
                } else {
                    rows.forEach((row) => {
                        console.log(JSON.stringify(row)); // Log each row to the console
                    });
                    resolve(`SQL executed: ${tableName}`);
                }
                // rows is an array of objects representing the records
            })
        });
    }
    (async () => {       // Then we create a asynch function that run the sql instruction one afer the others
        try {
            for (let tableName of tableNames) {
                const result = await displayTable(tableName);
            }
            db.close((err:any) => {
                if (err) {
                    console.error(err.message);
                }
                console.log('Database connection closed.');
            });
        } catch (err) {
            console.error(err);
        }
    })();
}

export function safeNumber(X: any): number {
  if (typeof X === "number" && !isNaN(X)) return X; // already a number
  const parsed = Number(X);
  return !isNaN(parsed) ? parsed : 0; // try to convert; fallback to 0
}

export function dbGet<T>(db: any, table: string, id: number): Promise<T | undefined> {
    //console.log(`Fetching from table ${table} id=${id}`);
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM ${table} WHERE id = ?`; // standard id-based query
    db.get(sql, [id], (err: Error | null, row: T | undefined) => {
      if (err) {
        return reject(err);
      }
      resolve(row);
    });
  });
}

function dbAll(db: any, sql: string, params: any[] = []) {
  return new Promise<any[]>((resolve, reject) => {
    db.all(sql, params, (err: any, rows: any[]) => (err ? reject(err) : resolve(rows || [])));
  });
}

export async function fetchByIds(db: any, table: string, ids: number[]) {
  // remove invalid ids for the SQL query only
  const uniqueIds = Array.from(new Set(ids.filter((x) => Number.isFinite(x) && x > 0)));
  if (uniqueIds.length === 0) return new Map<number, any>();

  const placeholders = uniqueIds.map(() => "?").join(",");
  const rows = await dbAll(db, `SELECT * FROM ${table} WHERE id IN (${placeholders})`, uniqueIds);

  const byId = new Map<number, any>();
  for (const r of rows) byId.set(Number(r.id), r);
  return byId;
}
