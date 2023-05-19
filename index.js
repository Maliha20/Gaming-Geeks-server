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
    await client.connect();
     
    const toyCollection = client.db('toyStore').collection('addedToys');

 
    app.post('/addtoy', async(req,res)=>{
        const newToy = req.body;
       const result = await toyCollection.insertOne(newToy);
       console.log(result)
       res.send(result)
 })
    app.get('/alltoys', async(req,res)=>{
   const result = await toyCollection.find().toArray()
        res.send(result)
    })
    app.get('/alltoys/:category', async(req,res)=>{
      console.log(req.params.category)
      if(req.params.category == "scrabble" || req.params.category == "puzzles" || req.params.category == "carcassonne"){
        const result = await toyCollection.find({subCategory: req.params.category}).toArray();
        return res.send(result)
      }
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
