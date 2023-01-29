const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js"); // importing local module
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

mongoose.set("strictQuery", false);// this is required to avoid deprecation warning

const url = "mongodb+srv://test123:test123@cluster0.fmisnzc.mongodb.net/todolistDB";

mongoose.connect(url);

// item schema
const itemsSchema = new mongoose.Schema({
    name: String
});

// item model
const ItemModel = mongoose.model("Item", itemsSchema);

app.set("view engine", "ejs"); //to tell node that we are using ejs

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

app.use(express.static("public")); //to save all the file we want to access from our dynamic page


const item1 = new ItemModel({
    name: "Welcome to your todolist !"
});

const item2 = new ItemModel({
    name: "Hit the + button to add a new item"
});

const item3 = new ItemModel({
    name: "<-- hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
    name: String,
    item: [itemsSchema]
});

const ListModel = mongoose.model("List", listSchema);


// for home route
app.get("/", (req, res) => {

    ItemModel.find({}, (err, foundItems) => {
        if (err) {
            console.log(err);
        } else {
            if (foundItems.length === 0) {
                ItemModel.insertMany(defaultItems, (err, res) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("data successfully added");
                    }
                });
                res.redirect("/")
            } else {
                res.render("list", { listTitle: "Today", newTodoItems: foundItems });
            }
        }
    });


});

// for home route
app.post("/", (req, res) => {
    const itemName = req.body.todoItem;
    const listName = req.body.list;

    const newItem = new ItemModel({
        name: itemName
    });

    if (listName === "Today") {
        newItem.save();
        res.redirect("/");
    } else {
        ListModel.findOne({ name: listName }, (err, foundLIst) => {
            foundLIst.item.push(newItem);
            foundLIst.save();
            res.redirect("/" + listName);
        });
    }
});


// for /delete route
app.post("/delete", (req, res) => {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        ItemModel.findByIdAndRemove(checkedItemId, (err) => {
            if (!err) {
                console.log("successfully deleted item");
                res.redirect("/");
            }
        });
    } else {
        ListModel.findOneAndUpdate({ name: listName }, { $pull: { item: { _id: checkedItemId } } }, (err, foundList) => {
            if (!err) {
                res.redirect("/" + listName);
            }
        })
    }

});

app.get("/:cutomListName", (req, res) => {

    const customListName = _.capitalize(req.params.cutomListName);

    ListModel.findOne({ name: customListName }, (err, foundList) => {
        if (!err) {
            if (!foundList) {
                // create new list
                const list = new ListModel({
                    name: customListName,
                    item: defaultItems
                });

                list.save();
                res.redirect("/" + customListName);
            } else {
                // show existing list
                res.render("list", { listTitle: customListName, newTodoItems: foundList.item });
            }
        }
    })



});

app.listen(5000, () => {
    console.log("the server has started on port 5000");
});