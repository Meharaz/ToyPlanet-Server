const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// mongoDB


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lh2z9vy.mongodb.net/?retryWrites=true&w=majority`;

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

        const toyCollection = client.db('toyPlanet').collection('toys')
        // all toys 

        app.get("/allToys", async (req, res) => {
            const result = await toyCollection.find({}).limit(20).sort({ price: 1 })
                .collation({ locale: "en_US", numericOrdering: true }).toArray();
            res.send(result);
        });
        
        // find
        // app.get('/toys', async (req, res) => {
        //     const cursor = toyCollection.find();
        //     const result = await cursor.toArray();
        //     res.send(result);
        // })
        // category 
        app.get('/toyCategory/:text', async (req, res) => {
            if (req.params.text == "Outdoor" || req.params.text == "Indoor" || req.params.text == "Kids") {
                const result = await toyCollection
                    .find({ category: req.params.text })
                    .toArray();
                return res.send(result);
            }
            const result = await toyCollection.find().toArray();
            res.send(result);
        })




        // single toy 

        app.get('/singleToy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toyCollection.find(query).toArray();
            res.send(result);
        })




        // search toy

        app.get('/searchToy/:text', async (req, res) => {
            const text = req.params.text;
            const result = await toyCollection
                .find({
                    $or: [
                        { name: { $regex: text, $options: "i" } },
                        { category: { $regex: text, $options: "i" } },
                    ],
                })
                .toArray();
            res.send(result);
        });
        // my toys

        app.get("/myToys/:text", async (req, res) => {
            const result = await toyCollection
                .find({ seller: req.params.text })
                .sort({ price: 1 })
                .collation({ locale: "en_US", numericOrdering: true })
                .toArray();
            res.send(result);
        });
        // update-toy
        app.put("/updateToy/:id", async (req, res) => {
            const id = req.params.id;
            const body = req.body;
            const filter = { _id: new ObjectId(id) };
            const updateToy = {
                $set: {
                    price: body.price,
                    quantity: body.quantity,
                    description: body.description,
                    photo: body.photo,
                }
            }
            const result = await toyCollection.updateOne(filter, updateToy);
            res.send(result);
        })
        // add toys
        app.post('/toys', async (req, res) => {
            const addToy = req.body;
            console.log(addToy);
            const result = await toyCollection.insertOne(addToy);
            res.send(result);
        })
        // delete Toy
        app.delete("/deleteToy/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            result = await toyCollection.deleteOne(query);
            res.send(result);
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


app.get('/', (req, res) => {
    res.send('Toy Planet is Running NOW');
})
app.listen(port, () => {
    console.log(`Toy Planet is running on port: ${port}`)
})