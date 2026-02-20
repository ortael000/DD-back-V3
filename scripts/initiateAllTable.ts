import sqlite3 from "sqlite3";
import { getdb,executeSQLs, consoleLogtableContent, consoleLogTableStructure , createTableFromStructure, createNewEntry, deleteTable, displayAllTableOfDb } from "../src/helpers/databaseHelpers";
import 'dotenv/config'; 
import { equipmentDataBase } from "../src/data/equipmentDataBase";
import { passiveDatabase } from "../src/data/passiveDatabase";
import { weaponsDataBase } from "../src/data/weaponsDataBase";
import { skillsDataBase } from "../src/data/skillDataBase";
import { inventoryDataBase } from "../src/data/inventory";
import { ennemiesBase } from "../src/data/ennemiesDataBase";
import { lootsBase } from "../src/data/LootsDataBase";
import {accesoriesBase} from "../src/data/accesoriesDataBase";

import { basicCharacter } from "../src/data/charactersInit";

 
console.log("on lance initiate all table")

const db = getdb()
const charSchemaPath = process.env.Character_Table_JSON_SCHEMA_PATH as string

export const allTables = [
   // {name : "charactersBase", Schema : charSchemaPath + "charactersBase.json", database : [basicCharacter] },
    {name : "equipmentsBase", Schema : charSchemaPath + "equipmentsBase.json", database : equipmentDataBase},
    {name : "passivesBase", Schema : charSchemaPath + "passivesBase.json", database : passiveDatabase},
    {name : "weaponsBase", Schema : charSchemaPath + "weaponsBase.json", database : weaponsDataBase},
    {name : "skillsBase", Schema : charSchemaPath + "skillsBase.json", database : skillsDataBase},
   // {name : "inventoryBase", Schema : charSchemaPath + "inventoryBase.json", database : inventoryDataBase},
   // {name : "characterPassword", Schema : charSchemaPath + "characterPassword.json", database : [{Id: 0, Password: "\"password\""}]},
    {name : "ennemiesBase", Schema : charSchemaPath + "ennemiesBase.json", database : ennemiesBase},
    {name : "lootsBase", Schema : charSchemaPath + "lootsBase.json", database : lootsBase},
    {name : "accessoriesBase", Schema : charSchemaPath + "accessoriesBase.json", database : accesoriesBase},
]

let sqlInstruction : string[] = [];

for (let i = 0; i < allTables.length; i++) {
    sqlInstruction.push(deleteTable(allTables[i].name));
}

for (let i = 0; i < allTables.length; i++) {
    sqlInstruction.push(createTableFromStructure(allTables[i].Schema)) 
    console.log("create table " + allTables[i].name)
}

for (let i =0; i < allTables.length; i++) {
    for (let j =0; j < allTables[i].database.length; j++) {
        sqlInstruction.push(createNewEntry(allTables[i].name, allTables[i].database[j]))
    }
}

executeSQLs(db, sqlInstruction);



