const dotenv = require("dotenv").config();
const express = require("express");
const mongoose  = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoute = require("./routes/userRoute") ;
const errorHandler = require("./middleWare/errorMiddleware");
const cookieParser = require("cookie-parser");
const productRoutes = require("./routes/productRoute");
const contactRoute = require("./routes/contactRoute");
const app  = express();


//Middlewares
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }));
// app.use(bodyParser.json())
app.use(bodyParser.json());
// Enable CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);



//Routes Middleware 
app.use("/api/users", userRoute);
app.use("/api/products", productRoutes);
app.use("/api/contactus", contactRoute);


//Routes
app.get("/", (req, res) => {
    res.send("Home Page");
});

//Error Middleware
app.use(errorHandler);

//Connect to DB and start server mongodb+srv://shreyasisahaedu9:YD0iJ3JEdbsVR25I@cluster0.0mw28jc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
const PORT = process.env.PORT || 5000;
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {

        app.listen(PORT, () => {
            console.log(`Server Running on port ${PORT}`)
        })
    })
    .catch((err) => {
        console.error("MongoDB connection failed:", err);
      });
      

      