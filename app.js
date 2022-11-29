//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");

// let items =["Raj", "Rajnish "];
// let workItems=[];
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

// mongoose.connect('mongodb://localhost:27017/todolistDB', {
//   useNewUrlParser: true
// });
const uri = "mongodb+srv://adminRaj:Rajnish@cluster0.jeqtfdd.mongodb.net";

mongoose.connect(uri,{useNewUrlParser: true, dbName:"todolistDB"});
const itemSchema = new mongoose.Schema({

  name: {

    type: String,

    required: [true, 'Please put the name of activity']

  }

});
// this is the model and it saved inside the collection and it changes from singular to plural internally
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({

  name: "Welcome to my ToDoList"

});



const item2 = new Item({

  name: "Hit + to add items to the list"

});



const item3 = new Item({

  name: "<-- hit this to remove item"

});



const defaultItems = [item1, item2, item3];
const listSchema = new mongoose.Schema({
  name: String,
  item: [itemSchema]
});

const List = mongoose.model("List", listSchema)

app.get("/", function(req, res) {
  Item.find({}, function(err, foundItem) {
    if (foundItem.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Data saved successfully into the database");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItem
      });

    }

  });
});
// handling the request that we send from the local host and it is saved on the database
app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          item: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.item
        })

      }
    }
  })

});
app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.item.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }


});
app.post("/delete", function(req, res) {
  const checkItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName ==="Today")
  {
    Item.findByIdAndRemove(checkItemId, function(err) {
      if (!err) {
        console.log("deleted successfully checked item");
      }
    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull: {item:{_id: checkItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

});



app.get("/about", function(req, res) {
  res.render("about");
});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.listen(port, function() {
  console.log("Server has started successfully");
});
