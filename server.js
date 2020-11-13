const express = require('express');
const database = require('./config/db').database;
const app = express();
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000;

// Dev only
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;


// Init Middleware
app.use(express.json({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req,res) => res.send('API running'));

//Define Routes
 app.use('/api/users', require('./routes/api/users'));
 app.use('/api/auth', require('./routes/api/auth'));
 app.use('/api/photos', require('./routes/api/photos'));
// app.use('/api/posts', require('./routes/api/posts'));
try {
database.sync().then(() => 
    console.log('DB synced')
)
} catch(err) {
    console.error(err);
}

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})