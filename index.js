const express = require('express');
const redis  = require('redis');
const util  = require('util');
const axios  = require('axios');

const redisUrl = 'redis://127.0.0.1:6379'
const client = redis.createClient(redisUrl)

client.set = util.promisify(client.set)
client.get = util.promisify(client.get)

const app = express()
app.use(express.json())

app.post('/', async (req,res)=>{
  const {key, value} = req.body;
  const resp = await client.set(key, value)
  res.json({key, value})
})

app.get('/',async(req, res)=>{
  const {key} = req.body;
  const value = await client.get(key);
  res.json(value)
})

app.get('/posts/:id',async(req,res)=>{
  const {id} = req.body;

  const cachedPost = await client.get(`post-${id}`)
  if(cachedPost){
    return res.json(JSON.parse(cachedPost))
  }
  const response = await axios(`https://jsonplaceholder.typicode.com/posts/${id}`)
  client.set(`post-${id}`, JSON.stringify(response.data),"EX", 100)
  return res.json(response.data)
})

app.listen(8080, ()=>{
  console.log("hey now listening on port on 8080")
})