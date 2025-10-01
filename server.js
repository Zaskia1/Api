const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(bodyParser.json());

// Load or initialize data
function loadData() {
  try {
    const raw = fs.readFileSync(DATA_FILE);
    return JSON.parse(raw);
  } catch (err) {
    return { customers: [], nextId: 1 };
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

let db = loadData();

// GET all customers
app.get('/customers', (req, res) => {
  res.json(db.customers);
});

// GET customer by id
app.get('/customers/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const customer = db.customers.find(c => c.id === id);
  if (!customer) return res.status(404).json({ error: 'Not found' });
  res.json(customer);
});

// CREATE customer
app.post('/customers', (req, res) => {
  const { name, gender, email, address } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const customer = { 
    id: db.nextId++, 
    name, 
    gender: gender || '', 
    email: email || '', 
    address: address || '' 
  };

  db.customers.push(customer);
  saveData(db);
  res.status(201).json(customer);
});

// UPDATE customer
app.put('/customers/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, gender, email, address } = req.body;
  const idx = db.customers.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  db.customers[idx] = { 
    ...db.customers[idx],
    name: name ?? db.customers[idx].name,
    gender: gender ?? db.customers[idx].gender,
    email: email ?? db.customers[idx].email,
    address: address ?? db.customers[idx].address
  };

  saveData(db);
  res.json(db.customers[idx]);
});

// DELETE customer
app.delete('/customers/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = db.customers.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const removed = db.customers.splice(idx, 1)[0];
  saveData(db);
  res.json(removed);
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Simple CRUD API (Customers) is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
