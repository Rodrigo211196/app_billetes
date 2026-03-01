const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { spawnSync } = require('child_process');

const app = express();
const port = 3001;
const allowedDenominations = new Set([10, 20, 50]);

app.use(cors());
app.use(express.json());

// Rebuild DB with the provided official ranges when the backend starts.
spawnSync(process.execPath, [path.resolve(__dirname, 'setup_db.js')], { stdio: 'inherit' });

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

app.get('/api/check', (req, res) => {
    const { denomination, serial } = req.query;
    const denom = Number.parseInt(denomination, 10);
    const serialText = String(serial ?? '').trim();
    const sn = Number.parseInt(serialText, 10);

    if (!allowedDenominations.has(denom)) {
        return res.status(400).json({ error: 'El corte debe ser 10, 20 o 50.' });
    }

    if (!/^\d{1,12}$/.test(serialText)) {
        return res.status(400).json({ error: 'El número de serie debe tener solo números (máximo 12 dígitos).' });
    }

    if (!Number.isInteger(sn) || sn <= 0) {
        return res.status(400).json({ error: 'El número de serie debe ser mayor a cero.' });
    }

    const query = `
        SELECT id
        FROM banknote_series
        WHERE denomination = ?
          AND ? BETWEEN start_num AND end_num
        LIMIT 1
    `;

    db.get(query, [denom, sn], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error de base de datos.' });
        }

        // The DB stores ranges that are NOT valid.
        if (row) {
            return res.json({
                valid: false,
                message: `Serie NO válida para corte Bs${denom}.`
            });
        }

        return res.json({
            valid: true,
            message: `Serie válida para corte Bs${denom}.`
        });
    });
});

app.listen(port, () => {
    console.log(`Servidor backend en http://localhost:${port}`);
});
