const express = require('express'); // Importing the express module
const bodyParser = require('body-parser');
const route = require('./routes/route.js');
const router = express.Router(); // Initializing the router from express
const { default: mongoose } = require('mongoose');
const app = express(); // Initializing the express and port number

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


mongoose.connect("mongodb+srv://Mousmi23:dUdaV8w8MnmYpHwY@cluster0.mkiuo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )


app.use('/', route); //

// App listening on the below port || Server listening on PORT
app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});