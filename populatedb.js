#! /usr/bin/env node

console.log('This script populates some test plants and categories to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
const userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
const async = require('async')
const Plant = require('./models/plant')
const Category = require('./models/category')

const mongoose = require('mongoose');
const mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const plants = []
const categories = []

function plantCreate(name, description, price, stock, image, category, cb) {
  plantdetail = { 
    name: name,
    description: description,
    price: price,
    stock: stock,
    image: image
  }
  if (category != false) plantdetail.category = category
    
  const plant = new Plant(plantdetail);    
  plant.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Plant: ' + plant);
    plants.push(plant)
    cb(null, plant)
  }  );
}

function categoryCreate(name, description, cb) {
  const category = new Category({ name: name, description: description });
       
  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Category: ' + category);
    categories.push(category)
    cb(null, category);
  }   );
}


function createCategories(cb) {
    async.series([
        function(callback) {
          categoryCreate(
            'Flowering Plants', 
            "Flowering house plants have become increasingly popular over the last few decades and its easy to see why. Watching the beginning of flowers bloom and the colorfulness the plant brings to a room is uplifting for the spirit and adds to the rooms attractiveness.", 
            callback
          );
        },
        function(callback) {
          categoryCreate(
            'Bulbous Plants', 
            "This selection of bulb type plants have been chose for those wishing to grow bulbous plants indoors. While many are very difficult to grow indoors this collection narrows down some fairly easy types for growers.", 
            callback
          );
        },        
        function(callback) {
          categoryCreate(
            'Succulent Plants', 
            "Drought resistant succulent plants are a special variety of plants that share similarities throughout their genera and families. In their natural habitat this plant type grows well in dry environments with little rainfall. This is why they produce leaves or organs that store water, preventing death when rainfall is non-existent for a period of time.", 
            callback
          );
        }
        ],
        // optional callback
        cb);
}


function createPlants(cb) {
    async.parallel([
        function(callback) {
          plantCreate(
            'Aloe', 
            "The Aloe plant is well known for its health and beauty benefits. These are very easy to care for and require little maintenance. Bright light without direct sunlight, a good soil mix that can keep the roots of the plant well aerated are part of keeping this species thriving.", 
            14.99, 
            11, 
            '/images/aloe.jpg',
            [categories[2],], 
            callback);
        },
        function(callback) {
          plantCreate(
            'Agave', 
            "The Century plant is also known as the Agave cactus, American aloe and maguey. In its natural sub-tropical habitat it can grow over 1.5m tall and has a wide spread. Variegated varieties are an attractive plant.", 
            24.49, 
            7, 
            '/images/agave.png',
            [categories[2],], 
            callback);
        },
        function(callback) {
          plantCreate(
            'Calla', 
            "Although an outdoor plant by nature, the Calla Lily will perform wonderfully as an indoor plant. These lilies require no encouragement to bloom. So long as the moisture and light conditions are within tolerance levels of the plant, the blooms will occur without any special attention.", 
            9.99, 
            36, 
            '/images/calla.png',
            [categories[0], categories[1],], 
            callback);
        },
        function(callback) {
          plantCreate(
            'Amaryllis', 
            "The amaryllis (common name) is part of the hippeastrum genus of bulbous plants which grow well indoors without too much hassle. This plant will bloom trumpet like flowers during winter which stand tall on hollow stalks. There are many very attractive flower types which includes red, orange, pink, and striped or shaded.", 
            17.50, 
            14, 
            '/images/amaryllis.png',
            [categories[0], categories[1]], 
            callback);
        },
        function(callback) {
          plantCreate(
            'Anthurium', 
            "The Flamingo flower blooms outstanding wax effect flowers with a kind of pigs curly orange tail that grows from the stalk through the flower. Although these tropical plants are beautiful they are quite difficult to care for compared to other types. These are a poisonous type of plant, best kept away from pets and kids.", 
            8.99, 
            16, 
            '/images/anthurium.png',
            [categories[0],], 
            callback);
        },
        function(callback) {
          plantCreate(
            'Cyclamen', 
            "This cyclamen is also known as the florist cyclamen because it’s sold at florist’s throughout the west to be grown indoors. This species is a flowering pot plant that most growers throw away after the flowering period, although they can be stored during dormancy to grow and re-flower the following year. The foliage grows very compact and is just as attractive as the colorful flowers.", 
            6.99, 
            32, 
            '/images/cyclamen.png',
            [categories[0],], 
            callback);
        },
        function(callback) {
          plantCreate(
            'Hibiscus', 
            "The Hibiscus rosa-sinensis has the common name of Rose of China, and originated in China. The flowers only last a couple of days, but they do bloom more than once – between spring and fall. The flowers are a kind of trumpet shape and bright in color. These are fairly easy-to-care for, but need plenty of light.", 
            12.99, 
            26, 
            '/images/hibiscus.png',
            [categories[0],], 
            callback);
        },
        function(callback) {
          plantCreate(
            'Primrose', 
            "Another winter and early spring bloomer worth picking up from the local garden center for it’s attractive flowers that sit at the top of tall stalks. The Primula obconica gets it’s common name of Poison primrose because of the plant causing skin irritation for those with sensitive skin. A tender perennial, although indoors it is also used as an annual.", 
            4.29, 
            46, 
            '/images/primrose.png',
            [categories[0],], 
            callback);
        },
        function(callback) {
          plantCreate(
            'Opuntia', 
            "We can see the obvious reason an Opuntia microdasys gets it’s common name of bunny ears (the pads that grow in the shape of rabbits or mouse ears). These grow an oval pad type stem that has polka dot looking glochids (hair spines) covering them, evenly. A grower has to be careful not to remove the glochids by accident.", 
            18.99, 
            4, 
            '/images/opuntia.png',
            [categories[2],], 
            callback);
        }
        ],
        // optional callback
        cb);
}

async.series([
    createCategories,
    createPlants
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    
    // All done, disconnect from database
    mongoose.connection.close();
});



