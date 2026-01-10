import { Router } from 'express';
import { getdb } from '../helpers/databaseHelpers.js';
import { calculateCharacterFull } from '../helpers/calculateCharacterHelpers.js'; 

const router = Router();

// Example route
router.get('/character/full/:id', async (req, res) => {

    console.log("Fetching character with ID:", req.params.id);


    const db = getdb();
    const id = req.params.id;

    const character = await calculateCharacterFull(db, Number(id));
    if (!character) {
        return res.status(404).send('Character not found');
    }
    res.json(character);
});

export default router;

