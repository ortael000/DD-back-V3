import sqlite3 from "sqlite3";

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

    