const express = require("express");

const bodyParser = require("body-parser");

const cors = require("cors");

const mongoClient = require("mongodb");

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

const url = "mongodb+srv://dbUser:dbUser@cluster0-1n5gp.mongodb.net/<dbname>?retryWrites=true&w=majority";

function generateShortUrl() {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 4; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


app.post('/longurl', (req, res) => {
    //console.log(req.body);


    mongoClient.connect(url,{ useNewUrlParser: true }, (err, client) => {
        if (err) throw err;

        let db = client.db('urlDb');
        let longUrl = req.body.longUrl;


        const urlBody = {
            long: longUrl
        }
        let matched = false;
        do {
            let shortUrl = generateShortUrl();


            urlBody.shortUrl = shortUrl;
            urlBody.redirectedUrl = "https://loh-url-shortener.herokuapp.com/"+ shortUrl;
            db.collection('allurl').findOne({ "shortUrl": shortUrl }, (err, value) => {
                if (err) throw err;

                if (value) {
                    //console.log(value);
                    console.log("Sorry the no already exists");
                }
                else {
                    //console.log(value);
                    //console.log("success");
                    matched = true;
                    db.collection('allurl').insertOne(urlBody, (err, data) => {
                        if (err) throw err;
        
                        client.close();
        
                        res.json(data);
                    })
                }
            })

        } while (matched == true);

        /* console.log("Exitted Do while"); */
        
    })
});

app.get('/url', (req, res) => {
    //console.log("in");
    mongoClient.connect(url, { useNewUrlParser: true },(err, client) => {
        if (err) throw err;

        let db = client.db('urlDb');

        db.collection('allurl').find().toArray((err, data) => {
            if (err) throw err;
            client.close();

            /* console.log(data); */
            res.json(data);
        })
    })
})

app.get("/:shortUrl", (req, res) => {

    //console.log(req.params.shortUrl);
    mongoClient.connect(url, (err, client) => {
        if(err) throw err;
        var db = client.db("urlDb");
        db.collection('allurl').findOne({"shortUrl":req.params.shortUrl}, (err, data) => {
            if(err) throw err;
            client.close();
            res.redirect(data.long);
        })
    })
})

app.delete("/:shortUrl", (req, res) => {
    //console.log(req.params.shortUrl);
    mongoClient.connect(url, (err, client) => {
        if(err) throw err;
        var db = client.db('urlDb');
        db.collection('allurl').deleteOne({"shortUrl":req.params.shortUrl}, (err, data) => {
            if(err) throw err;
            client.close();
            res.json({
                message : "Deleted"
            })
        })
    })
})

app.listen(process.env.PORT, () => {
    //console.log("app running at port");
})