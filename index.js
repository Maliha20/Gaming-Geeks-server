const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


//middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_PASSWORD}@cluster0.rtt8qfl.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
     client.connect();
     
    const toyCollection = client.db('toyStore').collection('addedToys');
    
    const indexKey = {name: 1};
    const indexOption = {name :"titleSearch"};
    const result = toyCollection.createIndex(indexKey,indexOption)
    

    app.get('/toySearchByName/:text', async(req,res)=>{
      const searchName = req.params.text;

      const result = await toyCollection.find({
        $or : [
          {name: {$regex: searchName, $options: "i"}}
       
        ]
      }).toArray();
      res.send(result)
    })

//  for adding toys from users
    app.post('/addtoy', async(req,res)=>{
        const newToy = req.body;
       const result = await toyCollection.insertOne(newToy);
       console.log(result)
       res.send(result)
 })
//  for all toys section
 
  app.get('/alltoys', async (req, res) => {
    let limit = 20;
    const result = await toyCollection.find().limit(limit).toArray();
    res.send(result);
  });


    // for subcategory
    app.get('/alltoys/:category', async(req,res)=>{
      console.log(req.params.category)
      if(req.params.category == "scrabble" || req.params.category == "puzzles" || req.params.category == "carcassonne"){
        const result = await toyCollection.find({subCategory: req.params.category}).toArray();
        return res.send(result)
      }
    })

    app.get('/toy/:id', async (req,res)=>{
      const id = req.params.id;
      console.log(id )
      const query = {_id: new ObjectId(id)}
      const result = await toyCollection.findOne(query)
      res.send(result)
     
  })
  // for my toys section 
  app.get('/addtoy/:email', async (req, res) => {
    const { email } = req.params;
    const { sort } = req.query; 
    const sortOptions = {};
    if (sort === 'lowtohigh') {
      sortOptions.price = 1; 
    } else if (sort === 'hightolow') {
      sortOptions.price = -1; 
    }
  
    const result = await toyCollection
      .find({ sellersMail: email })
      .sort(sortOptions)
      .toArray();
  
    res.send(result);
  });

    app.delete('/addtoy/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await toyCollection.deleteOne(query)
      res.send(result)
    })

    app.put('/updateToy/:id', async(req,res)=>{
      const id = req.params.id;
       const updatedToy = req.body
       const filter = {_id: new ObjectId(id)}
       const options ={upsert: true}
      const toy ={
        $set: {
            price:updatedToy.price, 
            quantity:updatedToy.quantity,
            description:updatedToy.description
        }
      }

      const result= await toyCollection.updateOne(filter, toy, options);
      res.send(result)
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");






  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
app.get('/', (req,res)=>{
    res.send('toy store is running')
})

app.listen(port,()=>{
console.log(`toy store is running on port, ${port}`)
})
