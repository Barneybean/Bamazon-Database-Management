var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');

// to establish connection with database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon_db"
});
// run function after connection
connection.connect(function(err) {
    if (err) throw err;
    console.log("Database " + connection.config.database + " connected");
    itemForSale();
});
// to display products 
var itemForSale = function () {
    var query = "select * from products";
    connection.query(query, function (err, res) {
        if (err) throw err;
        // to construct a table style for table cli npm
        var table = new Table({
            chars: {
                'top': '═' , 'top-mid': '╤' , 'top-left': '╔' ,         'top-right': '╗'
                , 'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
                , 'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
                , 'right': '║' , 'right-mid': '╢' , 'middle': '│' 
            }
        });
        // to create table header in terminal
        table.push(
            ['item_id', 'product_name', 'department_name', 'price','stock_quantity']
        );
        // to display seeds
        for (var i=0; i<res.length; i++) {
            table.push(
                [res[i].item_id, res[i].product_name, res[i].department_name, '$'+res[i].price, res[i].stock_quantity]
            );
        }
        console.log("\nAvailable items: \n" + table.toString());

        purchase()
    })
};

// prompt customer to purchase
function purchase() {
    inquirer.prompt([
        {
            type: "input",
            name: "id",
            message: "\nPlease enter item_id of the product you wish to buy from the list: (please enter one id at a time)",
            validate: function(value) {
                if (!isNaN(value)) {
                  return true;
                }
                return false;
            },
        },
        {
            type: "input",
            name: "quantity",
            message: "\nPlease enter quantity of the product you wish to buy from the list (please enter full number only):",
            validate: function(value) {
                if (!isNaN(value)) {
                  return true;
                }
                return false;
            },
        }
    ]).then(function (answer) {
        //get item quantity by item_id
        connection.query("select * from products where item_id = ?", [answer.id], function (err, res) {
            if (err) throw err;
            //warning if purchase more than stock quantity
            if (res[0].stock_quantity < answer.quantity) {
                console.log("\nsorry, we only have "+res[0].stock_quantity+" of this item left in stock.\n")
                purchase();
            }
            else {
                var totalCost = answer.quantity * res[0].price;
                console.log("\nThanks for shopping with us! Your order of "+answer.quantity+" "+res[0].product_name+" has been placed. \n" + "Your Total of this purchase is " + "$"+totalCost);
                //update new stock quantity
                var newQuantity = res[0].stock_quantity - answer.quantity;
                connection.query("update products set ? where ? ", 
                //must seperate objs
                [{
                    stock_quantity: newQuantity,
                },{
                    item_id: answer.id
                }],
                function (err, res) {
                    if (err) throw err;
                    connection.query("select * from products where item_id = "+ answer.id, function(err, newRes) {
                    console.log("\nInventory updated. There are " + newQuantity + " of "+newRes[0].product_name + " left\n");
                    nextAction();
                    });
                });
                
            };
        });
    });
};

function nextAction() {
    inquirer.prompt([
        {
            type: "list",
            name: "choice",
            message: "Would you like to check out other products?",
            choices: ["Yes", "No", "View Products again"]
        }
    ]).then(function (response) {
        // console.log(response.choice);
        switch (response.choice) {
            case "Yes":
            purchase();
            break;

            case "No":
            console.log("Thank you for shopping with us, please come back next time!\n")
            break;

            case "View Products again":
            itemForSale();
            break;
        }
    });
}

module.exports = {
    itemForSale: itemForSale
}