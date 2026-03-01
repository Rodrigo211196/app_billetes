const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(path.resolve(__dirname, 'database.sqlite'));

db.serialize(() => {
    db.run('DROP TABLE IF EXISTS banknote_series');
    db.run(`
        CREATE TABLE banknote_series (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            denomination INTEGER NOT NULL,
            start_num INTEGER NOT NULL,
            end_num INTEGER NOT NULL
        )
    `);

    const stmt = db.prepare('INSERT INTO banknote_series (denomination, start_num, end_num) VALUES (?, ?, ?)');

    // Corte 10
    const series10 = [
        [10, 67250001, 67700000],
        [10, 69050001, 69500000],
        [10, 69500001, 69950000],
        [10, 69950001, 70400000],
        [10, 70400001, 70850000],
        [10, 70850001, 71300000],
        [10, 76310012, 85139995],
        [10, 86400001, 86850000],
        [10, 90900001, 91550000],
        [10, 91800001, 92250000]
    ];

    // Corte 20
    const series20 = [
        [20, 87280145, 91648549],
        [20, 96650001, 97100000],
        [20, 99800001, 100250000],
        [20, 100250001, 100700000],
        [20, 109250001, 109700000],
        [20, 110600001, 111050000],
        [20, 111050001, 111500000],
        [20, 111950001, 112400000],
        [20, 112400001, 112850000],
        [20, 112850001, 113500000],
        [20, 114200001, 114650000],
        [20, 114650001, 115100000],
        [20, 115100001, 115550000],
        [20, 118700001, 119150000],
        [20, 119150001, 119600000],
        [20, 120500001, 120950000]
    ];

    // Corte 50
    const series50 = [
        [50, 77100001, 77550000],
        [50, 78000001, 78450000],
        [50, 78900001, 96350000],
        [50, 96350001, 96800000],
        [50, 96800001, 97250000],
        [50, 98150001, 98600000],
        [50, 104900001, 105350000],
        [50, 105350001, 105800000],
        [50, 106700001, 107150000],
        [50, 107600001, 108050000],
        [50, 108050001, 108500000],
        [50, 109400001, 109850000]
    ];

    [...series10, ...series20, ...series50].forEach((range) => {
        stmt.run(range);
    });

    stmt.finalize();
    console.log('Base SQLite inicializada y cargada correctamente.');
});

db.close();
