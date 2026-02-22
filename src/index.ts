import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import sqlite3 from "sqlite3";
import { getdb, createNewEntry } from "./helpers/databaseHelpers";
import 'dotenv/config'; 

import { characterKeys } from "./data/keyList";
import { basicCharacter } from "./data/charactersInit";

import { buildUpdate } from "./helpers/updateTable";

import CharacterRoute from "./routes/CharacterRoute";
import CharacterFullRoute from "./routes/characterFullRoute";

const app = express();
app.use(cors()); // Enable CORS for all routes
const port = process.env.PORT || 3000;
const db = getdb();

app.use(bodyParser.json());

app.use('/', CharacterRoute);
app.use('/', CharacterFullRoute);

app.get('/inventory/:id', (req: any, res: any) => {
  // console.log("Fetching inventory for character ID:", req.params.id);
  const id = req.params.id;
  const query = `SELECT * FROM inventoryBase WHERE CharacterID = ?`;

  db.all(query, [id], (err, rows) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    if (!rows) {
      return res.status(404).send('No inventory items found');
    }
    if (rows.length === 0) {
      return res.json([]);
    }
    res.json(rows);
  });
});

app.get('/characters/all', (req :any, res:any) => {
    // console.log("Fetching all characters");
    const query = `SELECT * FROM charactersBase`;
    db.all(query, [], (err, rows) => {
        if (err) {
            // console.error('Error fetching all characters:', err.message);
            return res.status(500).send(err.message);
        }
        if (!rows || rows.length === 0) {
            return res.status(404).send('No items found');
        }
        res.json(rows);
        // console.log("Fetched characters:", rows);
    });
});

app.get('/inventorys/all', (req :any, res:any) => {
    // console.log("Fetching all inventory items");
    const query = `SELECT * FROM inventoryBase`;
    db.all(query, [], (err, rows) => {
        if (err) {
            // console.error('Error fetching all inventory items:', err.message);
            return res.status(500).send(err.message);
        }
        if (!rows || rows.length === 0) {
            return res.status(404).send('No items found');
        }
        res.json(rows);
        // console.log("Fetched characters:", rows);
    });
});

app.get('/equipment/:id', (req :any, res:any) => {
    const { id } = req.params;
    const query = `SELECT * FROM equipmentsBase WHERE id = ?`;
    db.get(query, [id], (err, row) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        if (!row) {
            return res.status(404).send('Item not found');
        }
        res.json(row);
    });
});

// GET /equipments?ids=1,2,5   ==>  means res.query = { ids: "1,2,5" }
app.get('/equipments', (req: any, res: any) => {
  // 1. Read the raw query string
  const idsParam = req.query.ids as string;
  if (!idsParam) {
    return res.status(400).send('Missing query parameter: ids');
  }

  // 2. Turn "1,2,5" into [1, 2, 5], dropping any invalid entries
  const ids = idsParam
    .split(',')                        // ["1", "2", "5"]
    .map((s) => parseInt(s, 10))       // [1, 2, 5]
    .filter((n) => !isNaN(n));         // ensure all are valid numbers

  // Guard against empty or invalid lists
  if (ids.length === 0) {
    return res.status(400).send('No valid IDs provided');
  }

  // 3. Create SQL placeholders for each ID: "?,?,?"
  const placeholders = ids.map(() => '?').join(',');

  // 4. Build the final query string
  const sql = `
    SELECT *
      FROM equipmentsBase
     WHERE id IN (${placeholders})
  `;

  // 5. Execute the query with bound parameters
  db.all(sql, ids, (err: Error | null, rows: any[]) => {
    if (err) {
      // SQL or database error
      return res.status(500).send(err.message);
    }

    // Send back an array of matching items (could be empty)
    res.json(rows);
  });
});

app.get('/equipments/all', (req: any, res: any) => {

  // 4. Build the final query string
  const sql = `SELECT * FROM equipmentsBase `;
  // 5. Execute the query with bound parameters
  db.all(sql, (err: Error | null, rows: any[]) => {
    if (err) {
      // SQL or database error
      return res.status(500).send(err.message);
    }

    // Send back an array of matching items (could be empty)
    res.json(rows);
  });
});

app.get('/weapon/:id', (req :any, res:any) => {
    const { id } = req.params;
    const query = `SELECT * FROM weaponsBase WHERE id = ?`;
    db.get(query, [id], (err, row) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        if (!row) {
            return res.status(404).send('Item not found');
        }
        res.json(row);
    });
});

// GET /weapons?ids=1,2,5   ==>  means res.query = { ids: "1,2,5" }
app.get('/weapons', (req: any, res: any) => {
  // console.log(req.query);
  // 1. Read the raw query string
  const idsParam = req.query.ids as string;
  if (!idsParam) {
    return res.status(400).send('Missing query parameter: ids');
  }

  // 2. Turn "1,2,5" into [1, 2, 5], dropping any invalid entries
  const ids = idsParam
    .split(',')                        // ["1", "2", "5"]
    .map((s) => parseInt(s, 10))       // [1, 2, 5]
    .filter((n) => !isNaN(n));         // ensure all are valid numbers

  // Guard against empty or invalid lists
  if (ids.length === 0) {
    return res.status(400).send('No valid IDs provided');
  }

  // 3. Create SQL placeholders for each ID: "?,?,?"
  const placeholders = ids.map(() => '?').join(',');

  // 4. Build the final query string
  const sql = `
    SELECT *
      FROM weaponsBase
     WHERE id IN (${placeholders})
  `;

  // 5. Execute the query with bound parameters
  db.all(sql, ids, (err: Error | null, rows: any[]) => {
    if (err) {
      // SQL or database error
      return res.status(500).send(err.message);
    }

    // Send back an array of matching items (could be empty)
    res.json(rows);
  });
});

app.get('/weapons/all', (req: any, res: any) => {

  const sql = `SELECT * FROM weaponsBase `;
  db.all(sql, (err: Error | null, rows: any[]) => {
    if (err) {
      // SQL or database error
      return res.status(500).send(err.message);
    }
    // Send back an array of matching items (could be empty)
    res.json(rows);
  });
});

app.get('/passive/:id', (req :any, res:any) => {
    const { id } = req.params;
    const query = `SELECT * FROM passivesBase WHERE id = ?`;
    db.get(query, [id], (err, row) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        if (!row) {
            return res.status(404).send('Item not found');
        }
        res.json(row);
    });
});

app.get('/passives/all', (req: any, res: any) => {

  const sql = `SELECT * FROM passivesBase `;
  db.all(sql, (err: Error | null, rows: any[]) => {
    if (err) {
      // SQL or database error
      return res.status(500).send(err.message);
    }
    // Send back an array of matching items (could be empty)
    res.json(rows);
  });
});

app.get('/skill/:id', (req :any, res:any) => {
    const { id } = req.params;
    const query = `SELECT * FROM skillsBase WHERE id = ?`;
    db.get(query, [id], (err, row) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        if (!row) {
            return res.status(404).send('Item not found');
        }
        res.json(row);
    });
});

app.get('/skills/all', (req: any, res: any) => {

  const sql = `SELECT * FROM skillsBase `;
  db.all(sql, (err: Error | null, rows: any[]) => {
    if (err) {
      // SQL or database error
      return res.status(500).send(err.message);
    }
    // Send back an array of matching items (could be empty)
    res.json(rows);
  });
});

app.put('/character/:id', (req:any, res:any) => {    // to modify one of several value of a character in the table charactersBase 
    const { id } = req.params; // Extracts the ID from the URL
    const updates = req.body; // Extracts the fields to be updated from the request body
    const fields = Object.keys(updates); // Gets the column names to be updated

    if (fields.length === 0) {
        return res.status(400).send('No fields to update');
    }

    const setClauses = fields.map(field => `${field} = ?`).join(', '); // Constructs the SQL SET clause    .join permet the transformer un array en string, ici avec un , entre chaque element du tableau
    const query = `UPDATE charactersBase SET ${setClauses} WHERE id = ?`; // Constructs the SQL query

    let values = fields.map(field => updates[field]); // Creates an array of values containing the values to be updated + the ID. Will be used to replace al the ? in the SQL request
    values.push(id)

    // Execute the query
    db.run(query, values, function(err) {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.sendStatus(204); // Sends a 204 No Content response on success
    });
});

app.post('/characterupdate', (req: any, res: any) => {
  
  const { id, updates } = req.body;

  const sqlInstruction = buildUpdate('charactersBase', id, updates, characterKeys).sql;
  const values = buildUpdate('charactersBase', id, updates, characterKeys).values;

  db.run(sqlInstruction, values, function (err: Error | null) {
    if (err) {
      return res.status(500).send(err.message);
    }
    if (this.changes === 0) {
      return res.status(404).send('Character not found');
    }
    return res.sendStatus(204);
  });
});

app.post('/charactercreate', (req: any, res: any) => {

  // console.log('Received character creation data:', req.body);
  
  const { name, password } = req.body;

  if (!name || !password) {
      return res.status(400).send('Missing name or password');
  }

  const columns = Object.keys(basicCharacter)
      .map((col) => `"${col}"`)
      .join(', ');
  const placeholders = Object.keys(basicCharacter)
      .map(() => '?')
      .join(', ');

  const updatedCharacter = { ...basicCharacter, Name: name };
  const values = Object.values(updatedCharacter);

  const sqlInstruction = `INSERT INTO charactersBase (${columns}) VALUES (${placeholders})`;

  const sqlPasswordInstruction = `INSERT INTO characterPassword ("CharacterId", "Password") VALUES (?, ?)`;

  // console.log('SQL Instruction:', sqlInstruction);
  // console.log('Values:', values);

  db.run(sqlInstruction, values, function (err: Error | null) {
    if (err) {
      return res.status(500).send(`Character insert error: ${err.message}`);
    }

    // console.log('Character created with ID:', this.lastID);

    const characterId = this.lastID;
    const valuesPassword = [characterId, password];

    // console.log('SQL Password Instruction:', sqlPasswordInstruction);
    // console.log('Values Password:', valuesPassword);

    // Second insert: user with character ID
    db.run(sqlPasswordInstruction, valuesPassword, function (err: Error | null) {
      if (err) {
        // console.error('Password insert error:', err.message);
        return res.status(500).send(`User insert error: ${err.message}`);
      }

      return res.status(201).json({ characterId });
    });
  });
});

app.post('/inventoryupdate', (req: any, res: any) => {
    const {
      CharacterID,
      ObjectID,
      Quantity,
      ObjectType,
      ObjectSubType,
      Name
  } = req.body;

  // console.log('Received inventory update data:', req.body);

  // Basic validation
  if (
    CharacterID == null ||
    ObjectID    == null ||
    Quantity    == null
  ) {
    return res.status(400).json({
      error: 'Missing required fields: CharacterID, ObjectID, Quantity'
    });
  }

  // Parse and validate numbers
  const charId = parseInt(CharacterID, 10);
  const objId  = parseInt(ObjectID, 10);
  const qty    = parseInt(Quantity, 10);

  if (
    isNaN(charId) ||
    isNaN(objId)  ||
    isNaN(qty)
  ) {
    return res.status(400).json({
      error: 'CharacterID, ObjectID, and Quantity must be valid integers'
    });
  }

  // Check existing entry
  const findSql = `
    SELECT * FROM inventoryBase
     WHERE CharacterID = ? AND ObjectID = ?`;
  db.get(findSql, [charId, objId], (err, row) => {
    if (err) {
      // console.error('Select error:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }

    // UPDATE existing row
    if (row) {
      if (qty > 0) {
        const updSql = `
          UPDATE inventoryBase
             SET Quantity = ?
           WHERE CharacterID = ?
             AND ObjectID    = ?`;
        db.run(updSql, [qty, charId, objId], function (err) {
          if (err) {
            console.error('Update error:', err.message);
            return res.status(500).json({ error: 'Failed to update' });
          }
          res.json({
            success: true,
            action: 'updated',
            CharacterID: charId,
            ObjectID: objId,
            Quantity: qty
          });
        });

      } else {
        // DELETE row when qty is zero
        const delSql = `
          DELETE FROM inventoryBase
           WHERE CharacterID = ?
             AND ObjectID    = ?`;
        db.run(delSql, [charId, objId], function (err) {
          if (err) {
            console.error('Delete error:', err.message);
            return res.status(500).json({ error: 'Failed to delete' });
          }
          res.json({
            success: true,
            action: 'deleted',
            CharacterID: charId,
            ObjectID: objId
          });
        });
      }

    
    } else {  // INSERT new row
      if (qty <= 0) {
        return res.status(400).json({
          error: 'Cannot insert with Quantity ≤ 0'
        });
      }
      const insSql = `
        INSERT INTO inventoryBase
          (CharacterID, ObjectType, ObjectSubType, ObjectID, Name, Quantity)
        VALUES (?,           ?,          ?,        ?,    ?,     ?)`;
      db.run(insSql, [charId, ObjectType, ObjectSubType, objId, Name, qty], function (err) {
        if (err) {
          console.error('Insert error:', err.message);
          return res.status(500).json({ error: 'Failed to insert' });
        }
        res.status(201).json({
          success: true,
          action: 'inserted',
          CharacterID: charId,
          ObjectID: objId,
          Quantity: qty
        });
      });
    }
  });
});

app.get('/ennemies/all', (req :any, res:any) => {
    console.log("Fetching all ennemies");
    const query = `SELECT * FROM ennemiesBase`;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching all ennemies:', err.message);
            return res.status(500).send(err.message);
        }
        if (!rows || rows.length === 0) {
            return res.status(404).send('No items found');
        }
        res.json(rows);
        console.log("Fetched characters:", rows);
    });
});

app.get('/loots/all', (req :any, res:any) => {
    console.log("Fetching all loots");
    const query = `SELECT * FROM lootsBase`;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching all ennemies:', err.message);
            return res.status(500).send(err.message);
        }
        if (!rows || rows.length === 0) {
            return res.status(404).send('No items found');
        }
        res.json(rows);
        console.log("Fetched loots:", rows);
    });
});


app.get('/loot/:LootTypeID', (req :any, res:any) => {
    console.log("Fetching all loots");
    const { LootTypeID } = req.params;
    const query = `SELECT * FROM lootsBase WHERE LootTypeID = ?`;
    db.all(query, [LootTypeID], (err, rows) => {
        if (err) {
            console.error('Error fetching all loots:', err.message);
            return res.status(500).send(err.message);
        }
        if (!rows || rows.length === 0) {
            return res.status(404).send('No items found');
        }
        res.json(rows);
        console.log("Fetched loots:", rows);
    });
});

app.get('/accessories/all', (req :any, res:any) => {
    console.log("Fetching all accessories");
    const query = `SELECT * FROM accessoriesBase`;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching all accessories:', err.message);
            return res.status(500).send(err.message);
        }
        if (!rows || rows.length === 0) {
            return res.status(404).send('No items found');
        }
        res.json(rows);
        console.log("Fetched accessories:", rows);
    });
});

app.get('/accessory/:id', (req :any, res:any) => {
    const { id } = req.params;
    const query = `SELECT * FROM accessoriesBase WHERE id = ?`;
    db.get(query, [id], (err, row) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        if (!row) {
            return res.status(404).send('Item not found');
        }
        res.json(row);
    });
});


app.post('/accessories/by-ids', (req: any, res: any) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "ids must be a non-empty array" });
  }

  // Create placeholders (?, ?, ?, ...)
  const placeholders = ids.map(() => '?').join(',');

  const query = `
    SELECT * 
    FROM accessoriesBase 
    WHERE id IN (${placeholders})
  `;

  db.all(query, ids, (err, rows) => {
    if (err) {
      console.error("Error fetching accessories by ids:", err.message);
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});