const express = require('express');
const app =  express()
require("dotenv").config();
const cors = require('cors');
const port = process.env.PORT ||  5000

app.use(cors())
app.use(express.json())

// Ll1p0d74HKOwk7wA


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://education:Ll1p0d74HKOwk7wA@cluster0.wvfzgln.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
      await client.connect();
       
      const bestServiceCollection = client.db('trevel').collection('bestServiec')
      const bookingCollection = client.db('trevel').collection('booking')
      const popTourCollection = client.db('trevel').collection('popTour')
      const hoildaysCollection = client.db('trevel').collection('holidays')
      const toursCollection = client.db('trevel').collection('tours')

      // Best Service
        app.get('/bestService',async(req,res)=>{
            const query = await bestServiceCollection.find({}).toArray()
            res.send(query)
        })
        app.get('/bestService/:id',async(req,res)=>{{
            const id = req.params.id
            const query = {_id:ObjectId(id)}
            const result = await bestServiceCollection.findOne(query)
            res.send(result)

        }})
        // All Trevel Booking
        app.post('/allBooking',async(req,res)=>{
            const booking = req.body
            const result  = await bookingCollection.insertOne(booking)
            res.send(result)
        })
        // PopTour
        app.get('/popTour',async(req,res)=>{
            const result  = await popTourCollection.find().toArray()
            res.send(result)
        })
        // Hoildays
        app.get('/holidays',async(req,res)=>{
            const result = await hoildaysCollection.find().toArray()
            res.send(result)
        })
        app.get('/perfectHoliday/:id',async(req,res)=>{
            const id = req.params.id
            const query = {_id:ObjectId(id)}
            const result = await hoildaysCollection.findOne(query)
            res.send(result)
        })
        // Tours
        app.get('/tours',async(req,res)=>{
            const result = await toursCollection.find().toArray()
            res.send(result)
        })
        app.get('/tours/:id',async(req,res)=>{
            const id = req.params.id
            const query = {_id:ObjectId(id)}
            const result = await toursCollection.findOne(query)
            res.send(result)
        })
    }
finally {
}
}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello Trevel!')
  })
  
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })