import sqlite3 from "sqlite3";
import { getdb,executeSQLs, displayTables, consoleLogtableContent, consoleLogTableStructure , createTableFromStructure, createNewEntry, deleteTable, displayAllTableOfDb } from "../src/helpers/databaseHelpers";
import 'dotenv/config'; 
import { allTables } from "./initiateAllTable";
import { charactersInit } from "../src/data/charactersInit";
import { table } from "console";

const allTablename = allTables.map(table => table.name);

console.log("on lance initiate all table")

const db = getdb()

console.log("la liste des db est la suivante:")
displayAllTableOfDb(db);

displayTables(db,allTablename)

