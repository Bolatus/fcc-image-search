var express = require('express');

var app = express();

const PORT = process.env.PORT;//8080;

var Client = require('node-rest-client').Client;
 
var client = new Client();
var mongo = require("mongodb").MongoClient;
 
// direct way 
/*client.get("https://pixabay.com/api/?key=3059205-7adaf94412520365291c5eeee&q=yellow+flowers&image_type=photo&page=1&per_page=10", function (data, response) {
    console.log(data.totalHits);
});*/

app.get('/api/imagesearch/:picname', function (req, res) {
  console.log("--New imagesearch query!!! "+req.param.picname);
  console.log(req.query);
  var page = "&page=1";
  if (req.query.offset && !isNaN(req.query.offset)){
      page = "&page="+req.query.offset;
  }

  mongo.connect("mongodb://user1:123@ds029665.mlab.com:29665/fcc-url-shortener-db", function(err, db) {
        if(!err) {
          console.log("We are connected");
          var collection = db.collection('latest_query');          
          collection.insert( { qry: req.params.picname }, function(err, result) {
            if(err) console.error(err);
            console.log("New query inserted.");
            db.close();
          });
        } 
  });


  client.get("https://pixabay.com/api/?key=3059205-7adaf94412520365291c5eeee&q="+req.params.picname+page+"&per_page=10", function (data, response) {
    //tags
    //webformatURL
    //pageURL
    var result = [];
    data.hits.forEach(function(item){
      result.push({
        alt_text:item.tags,
        img_url:item.webformatURL,
        page_url:item.pageURL
      });
      
    });

    res.send(result);
  }); 
});


app.get('/api/latest/imagesearch', function (req, res) {
   mongo.connect("mongodb://user1:123@ds029665.mlab.com:29665/fcc-url-shortener-db", function(err, db) {
        if(!err) {
          console.log("We are connected");
          var collection = db.collection('latest_query');          
          
          collection.find().sort({_id:-1}).limit(10).toArray(function(err,result){
              res.send(result);
          });

        } 
    });
});

app.get('/', function (req, res) {
  res.send('Hello! Welcome to the best image search API :)');
  });


app.listen(PORT, function () {
  console.log('Example app listening on port '+PORT);
});
