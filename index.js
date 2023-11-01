const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x4eccmn.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const postDataCollection = client.db("shareWave").collection("postData");
    const commentCollection = client.db("shareWave").collection("comment");
    const reactionCollection = client.db("shareWave").collection("reaction");
    // post data api
    app.get("/post", async (req, res) => {
      const result = await postDataCollection.find().toArray();
      res.send(result);
    });
    app.post("/post", async (req, res) => {
      const data = req.body;
      const result = await postDataCollection.insertOne(data);
      res.send(result);
    });

    app.patch("/post", async (req, res) => {
      const data= req.body
      const id = data.id
      const countLove = data.count
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          count: countLove
        },
      };
      const result = await postDataCollection.updateOne(filter, updateDoc);
     res.send(result)
    })

    //  reaction api
 app.get("/reaction/:id", async(req,res)=>{
  const id = req.params.id;
  const query = {id: id}
  const findReaction = await reactionCollection.find(query).toArray();
  const sum = findReaction.reduce((acc, currentValue) => {
    return acc + currentValue.count;
  }, 0);
  // console.log(findReaction)
  const result = {
    id: id,
    sum: sum
  };
  res.send({result})

 })
  app.post('/reaction',async(req,res)=>{
    const data = req.body;
    const query = {email:data.email }
    const result = await reactionCollection.find(query).toArray();
    const checkExist = result.find(exist=> exist.id === data.id)
    // console.log(checkExist)
     if(checkExist){
      
       return res.send({message: "already loved",count:checkExist.count})
     }
    const newCount = await reactionCollection.insertOne(data)
    res.send(newCount)
    
  })


    

    // comment api
    app.get("/comment/:id",async(req,res)=>{
        const id = req.params.id;
        const query = {id:id}
        const result = await commentCollection.find(query).toArray()
        res.send(result)

    })
    app.post("/comment", async (req, res) => {
      const comment = req.body;
      const result = await commentCollection.insertOne(comment);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
