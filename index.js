const express = require('express');
const app =  express()
require("dotenv").config();
const cors = require('cors');
const port = process.env.PORT ||  5000
const SSLCommerzPayment = require('sslcommerz-lts')

app.use(cors())
app.use(express.json())

// Ll1p0d74HKOwk7wA
const store_id = process.env.STORE_ID
const store_passwd = process.env.STORE_PASSWORD
const is_live = false

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
        app.get('/allBooking',async(req,res)=>{
            const email = req.query.email ;
              const query = { uid: email }
            const result = await bookingCollection.find(query).toArray()
            res.send(result)
        })
        app.get('/allBookings',async(req,res)=>{
          
            const result = await bookingCollection.find().toArray()
            res.send(result)
        })
        app.post('/allBooking',async(req,res)=>{
            const booking = req.body
            const result  = await bookingCollection.insertOne(booking)
            res.send(result)
        })
        // payment 
        app.post('/bookingPayment/:id',async(req,res)=>{
            const id = req.params.id
            if(!id){
                return res.redirect(`${process.env.CLIENT_URL}/dashborad`)
            }

            const query = {_id:ObjectId(id)}
            const booking = await bookingCollection.findOne(query)
            const {name,email,number,bookingPrice,bookingTourName} = booking
            if(!name || !email || !number || !bookingPrice || !bookingTourName){
                return res.redirect(`${process.env.CLIENT_URL}/dashborad`)
            }
            const transcationId = new ObjectId().toString()
            const data = {
                total_amount: bookingPrice,
                currency: 'USD',
                tran_id: transcationId, // use unique tran_id for each api call
                success_url: `${process.env.SERVER_URL}/payment/success?transcationId=${transcationId}`,
                fail_url: `${process.env.SERVER_URL}/payment/fail`,
                cancel_url: 'http://localhost:3030/cancel',
                ipn_url: 'http://localhost:3030/ipn',
                shipping_method: 'Courier',
                product_name: bookingTourName,
                product_category: 'Travel',
                product_profile: 'general',
                cus_name: name,
                cus_email: email,
                cus_add1: 'Dhaka',
                cus_add2: 'Dhaka',
                cus_city: 'Dhaka',
                cus_state: 'Dhaka',
                cus_postcode: '1000',
                cus_country: 'Bangladesh',
                cus_phone: number,
                cus_fax: '01711111111',
                ship_name: 'Customer Name',
                ship_add1: 'Dhaka',
                ship_add2: 'Dhaka',
                ship_city: 'Dhaka',
                ship_state: 'Dhaka',
                ship_postcode: 1000,
                ship_country: 'Bangladesh',
            };
            const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
            sslcz.init(data).then(apiResponse => {
                // Redirect the user to payment gateway
                let GatewayPageURL = apiResponse.GatewayPageURL
                const updatedDoc = {
                    $set:{
                      paid:false,                      
              transactionId:transcationId
                    }
                  }
                bookingCollection.updateOne(query,updatedDoc)
               
                res.send({url:GatewayPageURL})
            });
        })

        app.post('/payment/success',async(req,res)=>{
           const {transcationId}  = req.query
           if (!transcationId) {
            return res.redirect(`${process.env.CLIENT_URL}/dashborad`)
           }
           const query = {transactionId:transcationId}
           const updatedDoc = {
            $set:{
              paid:true,
            }            
          }
          const result = await bookingCollection.updateOne(query,updatedDoc)
          if (result.modifiedCount > 0) {
            res.redirect(`${process.env.CLIENT_URL}/payment/success?transcationId=${transcationId}`)
          }
        })
        app.post('/payment/fail',(req,res)=>{
            res.redirect(`${process.env.CLIENT_URL}/dashborad`)
        })

        app.get('/booking/by-trancation-id/:id',async(req,res)=>{
            const id = req.params.id
            const booking = await bookingCollection.findOne({transactionId:id})
            res.send(booking)
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