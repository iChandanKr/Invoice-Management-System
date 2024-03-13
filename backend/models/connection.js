const { Sequelize, DataTypes } = require("sequelize");

const database = process.env.DATABASE;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;

// ==== TO CONNECT TO LOCAL DATABASE ====
const connectDB = new Sequelize(database, user, password, {
  host: "localhost",
  dialect: "postgres",
  logging: true,
});

// ==== TO CONNECT TO REMOTE DATABASE ====
// const connectDB = new Sequelize(
//   "postgres://invoice_db_v42o_user:QIAZyxp8hRZmEtlSTK17jYpAsNin4Az0@dpg-cnnvqr021fec73arfgvg-a.singapore-postgres.render.com/invoice_db_v42o?ssl=true"
// );

const db = {};
db.Sequelize = Sequelize;
db.connectDB = connectDB;
// db.Vendor = require('./vendorModel')(sequelize, DataTypes);

// Create separate file for each model schema.
// Add your model here:
// Ex - db.<ModelName> = require('<model-path>')(sequilize, DataTypes);

db.Product = require("./productModel")(connectDB, DataTypes);
db.Invoice = require("./invoiceModel")(connectDB, DataTypes);
db.Order = require("./orderModel")(connectDB, DataTypes);
db.Customer = require("./customerModel")(connectDB, DataTypes);
db.Address = require("./addressModel")(connectDB, DataTypes);
db.Vendor = require("./vendorModel")(connectDB, DataTypes);
db.AdminProduct = require("./adminProductModel")(connectDB, DataTypes);
db.VendorCustomer = require("./vendorCustomerModel")(connectDB, DataTypes);

// =============Admin-Invoice (: One to many)============================

db.Vendor.hasMany(db.Invoice);
db.Invoice.belongsTo(db.Vendor);

// ==============Admin-products (: Many to many)=========================

db.Vendor.belongsToMany(db.Product, { through: db.AdminProduct });
db.Product.belongsToMany(db.Vendor, { through: db.AdminProduct });

// ==============Admin-Client (: Many to many)=========================

db.Vendor.belongsToMany(db.Customer, { through: db.VendorCustomer });
db.Customer.belongsToMany(db.Vendor, { through: db.VendorCustomer });

// ==============Client-Address (: One to one)=========================

db.Customer.hasOne(db.Address);
db.Address.belongsTo(db.Customer);

// ==============Invoice-Order (: One to one)=========================

db.Invoice.hasOne(db.Order);
db.Order.belongsTo(db.Invoice);

// ==============Client-Invoice (: One to many)=========================

db.Customer.hasMany(db.Invoice);
db.Invoice.belongsTo(db.Customer);

const check = async () => {
  try {
    await connectDB.authenticate();
    console.log("Connection has been established successfully.");
    await db.connectDB.sync({ force: true });
    console.log("All models were synchronized successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

module.exports = { db, check };