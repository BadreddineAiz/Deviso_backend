import { connect } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../config.env' });
import sqlite3 from 'sqlite3';
import User from '../model/userModel.js';

connect(process.env.MONGO_URI)
    .then((response) => {
        console.log(`MongDB Connected : ${response.connection.host}`);
    })
    .catch((error) => {
        console.log('Error in DB connection: ' + error);
    });

// Enable verbose mode for debugging
sqlite3.verbose();

const dbPath = './M_DataBase.db';

// Connect to the database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

const query = 'SELECT * FROM Produits';

// Execute the query
db.all(query, [], async (err, rows) => {
    if (err) {
        console.error('Error executing query:', err.message);
    } else {
        const suggestions = rows.map((row) => row.designation);
        console.log(suggestions);
        const targetUser = await User.findById('6777f6238c5d83b0c87f0134');
        console.log(targetUser);
        targetUser.suggestionsList = suggestions;
        await targetUser.save({ validateBeforeSave: false });
    }

    // Close the database connection
    db.close((err) => {
        if (err) {
            console.error('Error closing the database:', err.message);
        } else {
            console.log('Database connection closed.');
        }
    });
});

// const products = JSON.parse(readFileSync('products_example.json', 'utf-8'));

// const importData = async () => {
//     try {
//         await create(products);
//         console.log('Data uploaded successfully !');
//         process.exit(1);
//     } catch (err) {
//         console.log(err);
//     }
// };

// const deleteAllData = async () => {
//     try {
//         await deleteMany();
//         console.log('Data Deleted successfully !');
//         process.exit(1);
//     } catch (err) {
//         console.log(err);
//     }
// };

// if (process.argv[2] == '--import') {
//     importData();
// } else if (process.argv[2] == '--delete') {
//     deleteAllData();
// }
