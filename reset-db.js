const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./oralvis.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

db.serialize(() => {
    // Drop the users table to ensure a clean start
    db.run("DROP TABLE IF EXISTS users", (err) => {
        if (err) {
            console.error("Error dropping table:", err.message);
        } else {
            console.log("Existing users table dropped.");
        }

        // Recreate the users table
        db.run(`CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error("Error creating table:", err.message);
            } else {
                console.log("New users table created.");
                
                // Seed the new users
                const users = [
                    { email: "tech@oralvis.com", password: "password123", role: "Technician" },
                    { email: "dentist@oralvis.com", password: "password123", role: "Dentist" },
                ];

                users.forEach(user => {
                    bcrypt.hash(user.password, 10, (err, hash) => {
                        if (err) {
                            console.error("Error hashing password:", err.message);
                            return;
                        }
                        db.run("INSERT INTO users (email, password, role) VALUES (?, ?, ?)", [user.email, hash, user.role], function(err) {
                            if (err) {
                                console.error(`Error inserting user ${user.email}:`, err.message);
                            } else {
                                console.log(`User ${user.email} inserted.`);
                            }
                        });
                    });
                });
            }
            console.log("Database seeding complete. You can now close this script.");
            db.close();
        });
    });
});