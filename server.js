const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Load db.json
let db = JSON.parse(fs.readFileSync("db.json", "utf-8"));

// GET all customers
app.get("/customers", (req, res) => {
  res.json(db.customers);
});

// GET by ID
app.get("/customers/:id", (req, res) => {
  const customer = db.customers.find(c => c.id == req.params.id);
  customer ? res.json(customer) : res.status(404).json({ message: "Not found" });
});

app.post("/customers", (req, res) => {
  const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));

  const newCustomer = {
    id: db.nextId,
    ...req.body,
  };

  db.customers.push(newCustomer);
  db.nextId++;

  fs.writeFileSync("db.json", JSON.stringify(db, null, 2));

  res.status(201).json(newCustomer);
});

// UPDATE
app.put("/customers/:id", (req, res) => {
  const idx = db.customers.findIndex(c => c.id == req.params.id);
  if (idx > -1) {
    db.customers[idx] = { ...db.customers[idx], ...req.body };
    fs.writeFileSync("db.json", JSON.stringify(db, null, 2));
    res.json(db.customers[idx]);
  } else {
    res.status(404).json({ message: "Not found" });
  }
});

// DELETE
app.delete("/customers/:id", (req, res) => {
  db.customers = db.customers.filter(c => c.id != req.params.id);
  fs.writeFileSync("db.json", JSON.stringify(db, null, 2));
  res.json({ message: "Deleted" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
