// const express = require('express');
// const serveStatic = require("serve-static")
// const path = require('path');
// app = express();
// app.use(serveStatic(path.join(__dirname, 'dist')));
// const port = process.env.PORT || 80;
// app.listen(port);

var express = require('express');
var path = require('path');
var serveStatic = require('serve-static');
app = express();
app.use(serveStatic(__dirname + "/dist"));
var port = process.env.PORT || 5000;
app.listen(port);
console.log('server started '+ port);
