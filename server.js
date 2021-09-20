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
    date: String,
    userId: String,
  }
)

let Exercise = mongoose.model("Exercise", exerciseSchema);

app.post("/api/users/:_id/exercises",
  (req, res, next) => {
    let exedate = "";
    if (req.body.date == "") {
      let dateObj = new Date();
      let monStr = "";
      if (dateObj.getMonth() == 0) {
        monStr = "Jan";
      } else if (dateObj.getMonth() == 1) {
        monStr = "Feb";
      } else if (dateObj.getMonth() == 2) {
        monStr = "Mar";
      } else if (dateObj.getMonth() == 3) {
        monStr = "Apr";
      } else if (dateObj.getMonth() == 4) {
        monStr = "May";
      } else if (dateObj.getMonth() == 5) {
        monStr = "Jun";
      } else if (dateObj.getMonth() == 6) {
        monStr = "Jul";
      } else if (dateObj.getMonth() == 7) {
        monStr = "Aug";
      } else if (dateObj.getMonth() == 8) {
        monStr = "Sep";
      } else if (dateObj.getMonth() == 9) {
        monStr = "Oct";
      } else if (dateObj.getMonth() == 10) {
        monStr = "Nov";
      } else {
        monStr = "Dec";
      };
      let weekStr = "";
      if (dateObj.getDay() == 0) {
        weekStr = "Sun";
      } else if (dateObj.getDay() == 1) {
        weekStr = "Mon";
      } else if (dateObj.getDay() == 2) {
        weekStr = "Tue";
      } else if (dateObj.getDay() == 3) {
        weekStr = "Wed";
      } else if (dateObj.getDay() == 4) {
        weekStr = "Thu";
      } else if (dateObj.getDay() == 5) {
        weekStr = "Fri";
      } else if (dateObj.getDay() == 6) {
        weekStr = "Sat";
      }
      exedate = weekStr + " " + monStr + " " + dateObj.getDate().toString() + " " + dateObj.getFullYear().toString();
    } else {
      exedate = new Date(req.body.date);
      exedate = exedate.toString().substring(0, 15);
    }
    var exe = new Exercise(
      {
        description: req.body.description,
        duration: req.body.duration,
        date: exedate,
        userId: req.body._id,
      });
    exe.save();
    next();
  }, (req, res) => {
    Person.findById(req.body._id, (err, person) => {
      if (err) return console.log(err);
      let exedate = "";
      if (req.body.date == "") {
        let dateObj = new Date();
        let monStr = "";
        if (dateObj.getMonth() == 0) {
          monStr = "Jan";
        } else if (dateObj.getMonth() == 1) {
          monStr = "Feb";
        } else if (dateObj.getMonth() == 2) {
          monStr = "Mar";
        } else if (dateObj.getMonth() == 3) {
          monStr = "Apr";
        } else if (dateObj.getMonth() == 4) {
          monStr = "May";
        } else if (dateObj.getMonth() == 5) {
          monStr = "Jun";
        } else if (dateObj.getMonth() == 6) {
          monStr = "Jul";
        } else if (dateObj.getMonth() == 7) {
          monStr = "Aug";
        } else if (dateObj.getMonth() == 8) {
          monStr = "Sep";
        } else if (dateObj.getMonth() == 9) {
          monStr = "Oct";
        } else if (dateObj.getMonth() == 10) {
          monStr = "Nov";
        } else {
          monStr = "Dec";
        };
        let weekStr = "";
        if (dateObj.getDay() == 0) {
          weekStr = "Sun";
        } else if (dateObj.getDay() == 1) {
          weekStr = "Mon";
        } else if (dateObj.getDay() == 2) {
          weekStr = "Tue";
        } else if (dateObj.getDay() == 3) {
          weekStr = "Wed";
        } else if (dateObj.getDay() == 4) {
          weekStr = "Thu";
        } else if (dateObj.getDay() == 5) {
          weekStr = "Fri";
        } else if (dateObj.getDay() == 6) {
          weekStr = "Sat";
        }
        exedate = weekStr + " " + monStr + " " + dateObj.getDate().toString() + " " + dateObj.getFullYear().toString();
      } else {
        exedate = new Date(req.body.date);
        exedate = exedate.toString().substring(0, 15);
      }
      res.json({
        username: person.name,
        description: req.body.description,
        duration: parseInt(req.body.duration),
        date: exedate,
        _id: req.body._id
      })
    });
  })

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
    let exeCount = 0;
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
        exeCount++;
      });

      res.json(
        {
          username: exeName,
          count: exeCount,
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
