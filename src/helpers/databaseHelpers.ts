import sqlite3 from "sqlite3";
import fs from "fs"
import 'dotenv/config'; 

export function getdb() {  

    const dbPath = process.env.SQLITE_DB_FILE_PATH;   // access the path to the sql data base in a absolute way, by going to the environment variable. 

    if (!dbPath) {
        console.log("SQLITE_DB_FILE_PATH is not defined in env");
        throw new Error ("Eh bah non!")
        
    }
    const db = new sqlite3.Database(dbPath);

    return db
}

export function consoleLogtableContent (db : sqlite3.Database, tableName: string) {   // input ( la database sql qu'on veut lire, le nom de la table) output : genere un console log de la table demandee

    console.log("display the table" + tableName )
    db.all("SELECT * FROM "+ tableName, [], (err, rows) => {
        if (err) {
            throw err; // Handle error appropriately
        }
        // rows is an array of objects representing the records
        rows.forEach((row) => {
            console.log(JSON.stringify(row)); // Log each row to the console
        });
    });
}

export function consoleLogTableStructure (db : sqlite3.Database, tableName: string) {

    db.all(`PRAGMA table_info(${tableName});`, [], (err, rows) => { 
        if (err) { 
            throw err;
         } rows.forEach((row : any ) => {
             console.log(`Column: ${row.name}, Type: ${row.type}, Not Null: ${row.notnull}, Default Value: ${row.dflt_value}, Primary Key: ${row.pk}`); 
            }); 
        });
}

export function createTableFromStructure (jsonSchemaPath : string) {    // A function that takes in input a database and a JSON file that contains the schema for a SQL table and return the SQL instruction ot create the table

    const schema = JSON.parse(fs.readFileSync(jsonSchemaPath, 'utf8'));

    let sqlInstruction : string = "CREATE TABLE IF NOT EXISTS " + schema.title + "(id INTEGER PRIMARY KEY AUTOINCREMENT ";
    
    for (const key in schema.properties){
        sqlInstruction += ", " + key + " " + schema.properties[key].type

        if ((schema.properties[key].minimum !== undefined) && (schema.properties[key].maximum !== undefined)) {
            sqlInstruction += " CHECK(" + key + " >= " + (schema.properties[key].minimum) + " AND " + key + " <= " + (schema.properties[key].maximum) + ")";
        }

        if (schema.properties[key].enum !== undefined) {
            sqlInstruction += " CHECK(" + key + " IN (";
            for (let i = 0; i< schema.properties[key].enum.length; i++) {
                sqlInstruction += "\"" + schema.properties[key].enum[i] + "\""
                if(i < schema.properties[key].enum.length-1) {
                    sqlInstruction += ", "
                }
            }
            sqlInstruction += " )) "
        }
    }
    sqlInstruction += ")" 

    return(sqlInstruction)
}

export function createNewEntry(tableName: string,  newEntry : any) {

    console.log("create new entry in the table " + tableName + " with the following data: " + JSON.stringify(newEntry))
    let sqlInstruction : string = "INSERT INTO " + tableName + " (";
    
    let keys = Object.keys(newEntry); 
    let lastKey = keys[keys.length - 1];

    for (const key in newEntry){
        sqlInstruction += key;
        if(key !== lastKey){
            sqlInstruction += ", ";
        }
    }
    sqlInstruction += ") VALUES (";

    for (const key in newEntry){
        sqlInstruction += newEntry[key];
        if(key !== lastKey){
            sqlInstruction += ", ";
        }
    }
    sqlInstruction += ");";

    return(sqlInstruction);
}

export function deleteTable (tableName: string) {

    let sqlInstruction : string = "DROP TABLE IF EXISTS " + tableName;
    return (sqlInstruction)

}

export function displayAllTableOfDb (db: sqlite3.Database){
    let sql = `SELECT name FROM sqlite_master WHERE type='table'`; // Execute the query and display the results 
    db.all(sql, [], (err, rows : any[]) => { 
        if (err) { throw err; } rows.forEach((row) => {
             console.log(row.name); 
            }); 
        });
}

export function executeSQLs (db: sqlite3.Database, sqlInstructions : string[]) {  //take in input an array of SQL instruction to execute in an asynchronous way
    console.log("Executing SQL instructions...");
    const executeSQL = (sql : string) => {     // First we create a function that generate a promise to execute the sql statement and manage the promise resolution
        return new Promise((resolve, reject) => {
            db.run(sql, (err:any) => {
                if (err) {
                    reject(err.message);
                } else {
                    resolve(`---SQL executed: ${sql}`);
                }
            });
        });
    };
    
    (async () => {       // Then we create a asynch function that run the sql instruction one afer the others
        try {
            for (let sql of sqlInstructions) {
                console.log(`Executing SQL: ${sql}`);
                const result = await executeSQL(sql);
                console.log(result);
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

export function displayTables (db : sqlite3.Database, tableNames : string[]) {  // take in input a array of string (of table names) and console.log the content in those table in an asynchronous way
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