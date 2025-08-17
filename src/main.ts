import sqlite3 from "sqlite3";
import { getdb, consoleLogtableContent, consoleLogTableStructure , createTableFromStructure, createNewEntry, deleteTable, displayAllTableOfDb } from "./helpers/databaseHelpers";
import 'dotenv/config'; 

const charSchemaPath = process.env.Character_Table_JSON_SCHEMA_PATH as string
const db = getdb()

displayAllTableOfDb(db)
consoleLogtableContent(db,"charactersBase")
