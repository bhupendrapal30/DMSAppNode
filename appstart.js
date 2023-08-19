var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var authRoutes = require('./app/modules/auth/auth-routes/authRoutes');
var bodyParser = require('body-parser');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data
var cors = require('cors');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
const { appBaseUrl,uploadDir} = require('./app/config/config');
global.__basedir = __dirname;
global.__appBaseUrl = appBaseUrl;
global.__uploadDir = __basedir+'/'+uploadDir;
require('./database/connection');
global.__basedir = __dirname;
// allow static files
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// app.get('/', (req, res) => {
// 	return res.send("home page"+__dirname);
// });
app.get('/',(req,res)=>{
   // res.send('hell word');
   res.sendFile(__dirname+'/index.html')
});
app.get('/update',(req,res)=>{
	// res.send('hell word');
	res.sendFile(__dirname+'/update.html')
 });
app.use('/api/user', authRoutes);
module.exports = http;
