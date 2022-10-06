const express = require('express');
const { ObjectId } = require('mongodb');
const { connectToDb, getDb } = require('./db');

// init app and middlewares
const app = express();
app.use(express.json());

// db cenntection
let db;

connectToDb((err) => {
    if (!err) {
        app.listen(3000, () => {
            console.log('Server is listening on port 3000');
        });

        db = getDb();
    }
});

// routes
app.get('/books', (req, res) => {

    const page = req.query.p || 0;
    const booksPerPage = 3;

    let books = []

    db.collection('books')
        .find() // returns a cursor with 2 methods: toArray and forEach
        .sort({ author: 1 })
        .skip(page * booksPerPage)
        .limit(booksPerPage)
        .forEach(book => books.push(book))
        .then(() =>{
            res.status(200).json(books);
        })
        .catch(() => {
            res.status(500).json({ error: 'Problem fatching data.' });
        });
});

app.get('/books/:id', (req, res) => {
    
    if (ObjectId.isValid(req.params.id)) {

        db.collection('books')
            .findOne({_id: ObjectId(req.params.id)})
            .then((doc) => {
                res.status(200).json(doc);
            })
            .catch(() => {
                res.status(500).json({error: 'Problem fatching data.'})
            });
    } else {
        res.status(500).json({ error: 'Not valid doc id'});
    }
});

app.post('/books', (req, res) => {
    const book = req.body;

    db.collection('books')
        .insertOne(book)
        .then((result) => {
            res.status(201).json(result);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({error: 'Problem creating record.'});
        });
});

app.delete('/books/:id', (req, res) => {

    if (ObjectId.isValid(req.params.id)) {

        db.collection('books')
            .deleteOne({_id: ObjectId(req.params.id)})
            .then((result) => {
                res.status(200).json(result);
            })
            .catch(() => {
                res.status(500).json({error: 'Problem deleting data.'})
            });
    } else {
        res.status(500).json({ error: 'Not valid doc id'});
    }
});

app.patch('/books/:id', (req, res) => {
    const updates = req.body;

    if (ObjectId.isValid(req.params.id)) {

        db.collection('books')
            .updateOne({_id: ObjectId(req.params.id)}, {$set: updates})
            .then((result) => {
                res.status(200).json(result);
            })
            .catch(() => {
                res.status(500).json({error: 'Problem updating data.'})
            });
    } else {
        res.status(500).json({ error: 'Not valid doc id'});
    }
});