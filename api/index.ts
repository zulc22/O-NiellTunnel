const express = require('express');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');

const app = express();
const port = 80;

import api from './api';

app.use( '/static', express.static('/static') );

app.use(fileUpload({ createParentPath: true }));
app.use(morgan('short'));

app.get('/', (req, res) => {
    res.redirect('/static/home');
});

api(app);

app.listen(port, () => {
    console.log(`Server running at :${port}.`);
});
