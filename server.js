const express = require('express')
const mongoose = require('mongoose')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(express.urlencoded({
  extended: true
}))
let uri = "mongodb+srv://dbUser:dbUserpw@cluster0.qjxut.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const { Schema } = mongoose;
const personSchema = new Schema(
  {
    name: { type: String, required: true }
  }
)

let Person = mongoose.model("Person", personSchema);

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post("/api/users", (req, res) => {
  var someone = new Person({ name: req.body.username });
  someone.save();
  res.json(
    {
      username: req.body.username,
      _id: someone._id
    });
})

const exerciseSchema = new Schema(
  {
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: String },
    userId: String,
  }
)

let Exercise = mongoose.model("Exercise", exerciseSchema);

app.post("/api/users/:_id/exercises",
  (req, res) => {
    let exedate = "";
    if (req.body.date == undefined) {
      exedate = new Date().toDateString();
    } else {
      exedate = new Date(req.body.date).toDateString();
    }
    console.log(req.body.date);
    var exe = new Exercise(
      {
        description: req.body.description,
        duration: req.body.duration,
        date: exedate,
        userId: req.params._id
      });
    exe.save();
    Person.findById(req.params._id, function (err, data) {
      res.json({
        username: data.name,
        description: req.body.description,
        duration: parseInt(req.body.duration),
        date: exedate,
        _id: req.params._id
      })
    })
  });

app.get("/api/users", (req, res) => {
  Person.find({}, function (err, docs) {
    if (err) return console.log(err);
    let allUsers = [];
    docs.forEach((item) => {
      let userObj = {
        username: item.name,
        _id: item._id
      }
      allUsers.push(userObj);
    })
    res.send(allUsers);
  });
})

app.get("/api/users/:_id/logs", (req, res) => {

  Exercise.find({ userId: req.params._id }, function (err, exeData) {
    if (err) return console.log(err);
    let logArr = [];

    Person.findById(req.params._id, function (err, person) {
      if (err) return console.log(err);
      let exeName = person.name;
      exeData.forEach(element => {
        let exeObj = {
          description: element.description,
          duration: element.duration,
          date: element.date
        }
        logArr.push(exeObj);
      });

      if (req.query.from != undefined) {
        let newArr = [];
        logArr.forEach(item => {
          let date1 = new Date(item.date);
          let dateFrom = new Date(req.query.from);
          if (date1 >= dateFrom) {
            newArr.push(item);
          }
        })
        logArr = newArr;
        console.log(req.query.from);
      };

      if (req.query.to != undefined) {
        let newArr = [];
        logArr.forEach(item => {
          let date1 = new Date(item.date);
          let dateTo = new Date(req.query.to);
          if (date1 <= dateTo) {
            newArr.push(item);
          }
        })
        logArr = newArr;
        console.log(req.query.to);
      };

      if (req.query.limit !== undefined) {
        let count = 0;
        let newArr = []
        logArr.forEach(item => {
          if (count < req.query.limit) {
            newArr.push(item);
            count++;
          }
        }
        )
        logArr = newArr;
        console.log(req.query.limit);
      }

      res.json(
        {
          username: exeName,
          count: logArr.length,
          _id: req.params._id,
          log: logArr
        }
      );
    })
  });
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
