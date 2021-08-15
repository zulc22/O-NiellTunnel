import express from 'express';
import fileUpload from 'express-fileupload';
import morgan from 'morgan';

const app = express();
const port = 80;

import api from './api.mjs';

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
