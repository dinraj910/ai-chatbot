const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>{
    res.send('Backend is running...✅✨');
})


app.post("/chat",async (req,res)=>{
    const {message} = req.body;
    try{
        const response = await axios.post("http://127.0.0.1:8000/generate", { message });
        res.json({ reply: response.data.reply });
    }catch{
        res.status(500).json({ error: 'Failed to generate response' });
    }
});

const PORT = process.env.PORT || 5000;

try{
    app.listen(PORT, () => {
        console.log(`Server is running on port http://localhost:${PORT} ✅✅✅`);
    });
}catch(error){
    console.error('Error starting server:', error);
}