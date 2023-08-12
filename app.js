const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const usersRoutes = require("./api/routes/users");


mongoose.connect("mongodb+srv://zubikhan:"+process.env.MONGO_ATLAS_PW+"@cluster0.crt70hd.mongodb.net/?retryWrites=true&w=majority", 
{
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.use(morgan("dev"));

app.use(bodyParser.urlencoded({
    extended: false,
}));

app.use(bodyParser.json()); 

app.use((req, res, next)=>{
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Headers', 
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if(req.method === 'OPTIONS'){
        res.header("Access-Control-Allow-Methods", 'PUT, POST, DELETE, PATCH, GET');
        return res.status(200).json();
    }
    next();
}); 

app.use('/users', usersRoutes);

app.use((req, res, next)=>{
    const error = new Error("Not Found, Check your resquest method");
    error.status = 404 ;
    next(error);
});

app.use((error, req, res, next)=>{
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
        }
    });
});


module.exports = app;