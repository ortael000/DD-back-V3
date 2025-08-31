const express = require('express');
const cors = require("cors");
const bodyParser = require('body-parser');
import sqlite3 from "sqlite3";
import { getdb, createNewEntry } from "./helpers/databaseHelpers";
import 'dotenv/config'; 

const app = express();
app.use(cors()); // Enable CORS for all routes
const port = 3000;
const db = getdb();

app.use(bodyParser.json());

app.get('/character/:id', (req :any, res:any) => {
    const id = req.params.id;
    const query = `SELECT * FROM charactersBase WHERE id = ?`;
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
  console.log(req.query);
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

app.get('/inventory/:CharacterID', (req: any, res: any) => {
    const { CharacterID } = req.params;
    const query = `SELECT * FROM inventoryBase WHERE CharacterID = ?`;
    db.all(query, [CharacterID], (err, rows) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        if (rows.length === 0) {
            return res.json({});
        }
        if (!rows) {
            return res.status(404).send('Item not found');
        }
        res.json(rows);
    });
});

app.post('/characterupdate', (req: any, res: any) => {
    const { id, charKey, value } = req.body;
    console.log('Received data to update character:', req.body);

    if (!id || !charKey || value === undefined) {
        return res.status(400).send('Missing required fields: id, charKey, value');
    }

    const query = `UPDATE charactersBase SET ${charKey} = ${value} WHERE id = ${id}`;

    db.run(query, function (err) {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.sendStatus(204);
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

  console.log('Received inventory update data:', req.body);

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
      console.error('Select error:', err.message);
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

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
