import sqlite3 from "sqlite3";
import { getdb,executeSQLs, displayTables, consoleLogtableContent, consoleLogTableStructure , createTableFromStructure, createNewEntry, deleteTable, displayAllTableOfDb } from "../src/helpers/databaseHelpers";
import 'dotenv/config'; 
import { allTables } from "./initiateAllTable";
import { table } from "console";

const allTablename = allTables.map(table => table.name);

console.log("on lance initiate inventory table")

const db = getdb()


displayTables(db,["inventoryBase"])

