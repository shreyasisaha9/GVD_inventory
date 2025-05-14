const dotenv = require("dotenv").config();
const express = require("express");
const mongoose  = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");


const app  = express()

const PORT = process.env.PORT || 5000;

//Connect to DB and start server mongodb+srv://shreyasisahaedu9:YD0iJ3JEdbsVR25I@cluster0.0mw28jc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {

        app.listen(PORT, () => {
            console.log(`Server Running on port ${PORT}`)
        })
    })
    .catch((err) => console.log(err))
    