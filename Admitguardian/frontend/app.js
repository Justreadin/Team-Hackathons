const express = require('express');
const app = express();
const {createServer} = require('http');
const {join} = require('path')
const server = createServer(app);
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD.OPTIONS.POST,PUT');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});
app.use(express.static(join(__dirname, './public/')));

server.listen(8888, () => console.log('Server running'));