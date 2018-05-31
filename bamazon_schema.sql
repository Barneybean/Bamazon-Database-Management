use bamazon_db;
create table products(
    item_id int(20) not null auto_increment,
    product_name varchar(45) not null,
    department_name varchar(45) not null,
    price decimal (10,2) null,
    stock_quantity int(10) not null,
    primary key (item_id)
);
