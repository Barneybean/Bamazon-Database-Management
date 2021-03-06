// var customer = require("./bamazonCustomer.js");
// customer.itemForSale();   //try to import the function from bamazonCustomer
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
    managerOption();
});
//to promt 4 options for manager
function managerOption() {
   
    inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "Hello Manager, please select an option: ",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
        }    
    ]).then(function(res) {
        switch (res.action) {
            case "View Products for Sale":
                return viewInv();

            case "View Low Inventory":
                return viewLowInv();
            
            case "Add to Inventory":
                return addInv();

            case "Add New Product":
                return addNew();
        };
    });
};
// to display table
function getData(query) {
    connection.query(query, function (err, res) {
        if (err) throw err;
        // to create table header in terminal
        // to construct a table style for table cli npm
        var table = new Table({
            chars: { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔' ,        'top-right': '╗'
                , 'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
                , 'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
                , 'right': '║' , 'right-mid': '╢' , 'middle': '│' }
        });
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
        managerOption();
    })
}

function viewInv(query) {
    var query = "select * from products where stock_quantity>0";
    getData(query);
};

function viewLowInv() {
    var query = "select * from products where stock_quantity<5";
    getData(query);
};

function addInv() {
    inquirer.prompt([
        {
            type: "input",
            name: "id",
            message: "Enter item_id of the product you wish to stock up: "
        },{
            type: "input",
            name: "quantity",
            message: "Enter quantity of the product you wish to stock up (integer only): "
        }
    ]).then(function (product) {
        //define query to update inventory
        var newQuant;

        //get quantity by id and add new stock quantity
        connection.query("select stock_quantity from products where item_id = ?", [product.id], function(err, res) {
            if(err) throw err;
            newQuant = parseInt(res[0].stock_quantity) + parseInt(product.quantity);

            connection.query("update products set ? where ?", [{stock_quantity: newQuant},{item_id: product.id}], function (err, data) {
                if(err) throw err;
                console.log(data.affectedRows + " product updated..");
                managerOption();
            });

        });
    })
}

function addNew() {
    inquirer.prompt([
        {
            type: "input",
            name: "product_name",
            message: "Enter New Product Name: ",
        },{
            type: "input",
            name: "department_name",
            message: "What department does it belong to? ",
            
        },{
            type: "input",
            name: "price",
            message: "Enter Price of the product, two decimals: ",
            
        },{
            type: "input",
            name: "quantity",
            message: "Enter stock quantity: ",
            
        }
    ]).then(function(res) {
        connection.query("insert into products set?", 
        {
            product_name: res.product_name,
            department_name: res.department_name,
            price: res.price,
            stock_quantity: res.quantity
        },
        function (err, data) {
            if(err) throw err;
            console.log(data.affectedRows + " product added..");
            managerOption();
        });
    });
};