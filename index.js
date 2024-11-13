const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
let bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: false}));

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

var userArray = [];
var exerciseArray = [];

app.post("/api/users", function(req, res){
  const id = Math.random().toString(16).slice(2);
  userArray.push({"username": req.body.username, "_id": id});
  res.json({"username": req.body.username, "_id": id});
  console.log(userArray);
});

app.get("/api/users", function(req, res){
  res.json(userArray);
});

app.post("/api/users/:_id/exercises", function(req, res){
  const userId = req.params._id;
  const user = userArray.find(user => user._id === userId);
  const username = user.username;
  var exerciseDate = NaN;

  if (!req.body.date){
    var dateToday = new Date().toDateString();
    exerciseDate = dateToday;
  } else {
    exerciseDate = new Date(req.body.date).toDateString();
  }

  var exerciseObject = {
    "_id": userId,
    "username": username,
    "description": req.body.description,
    "duration": Number(req.body.duration),
    "date": exerciseDate
  };

  exerciseArray.push(exerciseObject);
  res.json(exerciseObject);
  console.log(exerciseArray);
  
});

function getExerciseLogForUser(_id, from, to, limit){
  var logObject = {
    "username": "",
    "count": 0,
    "_id": _id,
    "log": []
  }

  exerciseArray.forEach(exercise => { 
    if (exercise._id == _id){
      var addExercise = true;
      if (from) {
        const exerciseDateFormat = new Date(exercise.date);
        const fromDateFormat = new Date(from);
        if (fromDateFormat > exerciseDateFormat){
          addExercise = false;
        }
      }
      if (to) {
        const exerciseDateFormat = new Date(exercise.date);
        const toDateFormat = new Date(to);
        if (toDateFormat < exerciseDateFormat){
          addExercise = false;
        }
      }
      if (limit && logObject.count >= limit) {
        addExercise = false;
      }

      if (addExercise) {
        logObject.count += 1;
        logObject.username = exercise.username;
        logObject.log.push({
          "description": exercise.description,
          "duration": exercise.duration,
          "date": exercise.date
        })
      }
    }      
  });

  return logObject;
}

app.get("/api/users/:_id/logs", function(req, res){
  // Get log to the user with given id
  // Log-structure
  // Add from, to, limit (max number of exercises)
  console.log(req.query)
  var exerciseLog = getExerciseLogForUser(req.params._id, req.query.from, req.query.to, req.query.limit);
  console.log(exerciseLog);
  res.json(exerciseLog);
})




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
