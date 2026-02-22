import sqlite3 from "sqlite3";
import { getdb } from "../src/helpers/databaseHelpers";
import 'dotenv/config'; 
import { allTables } from "./initiateAllTable";

console.log("on lance initiate all table")

const db = getdb()

const tableName = process.argv[2]

displayTables(db,tableName)


export function displayTables (db : sqlite3.Database, tableName : string) {  // take in input a array of string (of table names) and console.log the content in those table in an asynchronous way
    const displayTable = (tableName : string) => {     // First we create a function that generate a promise to execute the sql statement and manage the promise resolution
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM "+ tableName, [], (err, rows) => {
                if (err) {
                    reject(err.message);
                } else {
                    console.log(" // The content of the table " + tableName + " is: //")
                    rows.forEach((row) => {    // rows is an array of objects representing the records
                        console.log(JSON.stringify(row)); // Log each row to the console
                    });
                    resolve(`SQL executed: ${tableName}`);
                }
            })
        });
    }
    (async () => {       // Then we create a asynch function that run the sql instruction one afer the others
        try {
            const result = await displayTable(tableName);
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