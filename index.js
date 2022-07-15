const express = require('express');
const app = express();
const router = express.Router();
const path = require('path')

router.get('/', function(req, res){
  res.sendFile(path.join(__dirname, '/index.html'));
});
app.use('/', router);

app.use(express.static(path.join(__dirname, '/')));

app.listen(80, function(){
  console.log("App server is running on port 80");
});