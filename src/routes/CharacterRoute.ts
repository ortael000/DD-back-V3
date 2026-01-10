import { Router } from 'express';
import { getdb } from '../helpers/databaseHelpers.js';

const router = Router();

// Example route
router.get('/character/:id', async (req, res) => {

    console.log("Fetching character with ID:", req.params.id);

    const db = getdb();
    const id = req.params.id;
    const query = `SELECT * FROM charactersBase WHERE id = ?`;
    db.get(query, [id], (err : any, row : any) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        if (!row) {
            return res.status(404).send('Item not found');
        }
        res.json(row);
    });
});

export default router;