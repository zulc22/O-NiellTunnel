import express from 'express';
import morgan from 'morgan';
import fileUpload from 'express-fileupload';

import api from './api';

const app = express();
const port = 80;

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
