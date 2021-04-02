var express = require ('express')
var app = express()
app.use(express.static('static'))

app.use(function(req, res, next) {
    // allow diff IP address
    res.header("Access-Control-Allow-Origin","*");
    // allow diff header fields
    res.header("Access-Control-Allow-Headers","*");
    next();
});

const port = process.env.PORT || 3000
app.listen(port)
console.log("listening on port" ,port)
