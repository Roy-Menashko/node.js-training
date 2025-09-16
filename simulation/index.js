// index.js
// Minimal Express API wrapping your existing Store (unchanged).
const express = require("express");
const Store = require("./classes/store");
const Vegetable = require("./classes/vegetables");
const Costumer = require("./classes/costumers"); // file exports your Customer class

const app = express();
app.use(express.json());

const store = new Store();

// ---------- Vegetables ----------
app.get("/vegetables", (req, res) => {
  res.json(store.getAllVegetables());
});

// Get single vegetable by NAME (Store keys by name)
app.get("/vegetables/:name", (req, res) => {
  const name = req.params.name;
  const veg = store.getAllVegetables()[name];
  if (!veg) return res.status(404).json({ message: "Vegetable not found" });
  res.json(veg);
});

// Create vegetable
app.post("/vegetables", (req, res) => {
  const { name, id, amount, price } = req.body;
  if (!name || id == null || amount == null || price == null) {
    return res.status(400).json({ message: "name, id, amount, price are required" });
  }
  const veg = new Vegetable(name, id, amount, price);
  store.addVegetable(veg);
  res.status(201).json({ message: "Vegetable added" });
});

// Update ONLY amount (safe: doesn't break price-sorted array)
app.put("/vegetables/:name/amount", (req, res) => {
  const name = req.params.name;
  const { amount } = req.body;
  const veg = store.getAllVegetables()[name];
  if (!veg) return res.status(404).json({ message: "Vegetable not found" });
  if (amount == null || isNaN(Number(amount)) || Number(amount) < 0) {
    return res.status(400).json({ message: "Valid 'amount' is required" });
  }
  veg.setAmount(Number(amount));
  res.json({ message: "Amount updated", vegetable: veg });
});

// Delete vegetable by NAME
app.delete("/vegetables/:name", (req, res) => {
  const name = req.params.name;
  const result = store.removeVegetable(name);
  if (!result.success) return res.status(404).json(result);
  res.json(result);
});

// Cheapest / Most expensive
app.get("/vegetables/cheapest", (req, res) => {
  const v = store.getCheapestVeg();
  if (!v) return res.status(404).json({ message: "No vegetables in stock" });
  res.json(v);
});

app.get("/vegetables/expensive", (req, res) => {
  const v = store.getMostExpensiveVeg();
  if (!v) return res.status(404).json({ message: "No vegetables in stock" });
  res.json(v);
});

// Sorted-by-price snapshot (ascending)
app.get("/vegetables/sorted", (req, res) => {
  res.json(store.getSortedVeg());
});

// ---------- Customers (your Store uses 'costumers') ----------
app.get("/costumers", (req, res) => {
  res.json(store.getAllCustomers());
});

// Get single costumer by ID
app.get("/costumers/:id", (req, res) => {
  const id = req.params.id;
  const costumer = store.getCostumers()[id];
  if (!costumer) return res.status(404).json({ message: "Costumer not found" });
  res.json(costumer);
});

// Create costumer
app.post("/costumers", (req, res) => {
  const { id, name, phone } = req.body;
  if (id == null || !name || !phone) {
    return res.status(400).json({ message: "id, name, phone are required" });
  }
  const costumer = new Costumer(id, name, phone);
  store.addCustomer(costumer);
  res.status(201).json({ message: "Costumer added" });
});

// Update costumer basic fields (name/phone)
app.put("/costumers/:id", (req, res) => {
  const id = req.params.id;
  const c = store.getCostumers()[id];
  if (!c) return res.status(404).json({ message: "Costumer not found" });

  const { name, phone } = req.body;
  if (name) c.setName(name);
  if (phone) c.setPhone(phone);
  res.json({ message: "Costumer updated", costumer: c });
});

// Purchase summary leaders
app.get("/costumers/top", (req, res) => {
  const num = Number(req.query.num || 3); // GET must use query params
  res.json(store.getBestCustomers(num));
});

// Costumer purchase history
app.get("/costumers/:id/history", (req, res) => {
  const id = req.params.id;
  const c = store.getCostumers()[id];
  if (!c) return res.status(404).json({ message: "Costumer not found" });
  res.json(c.getHistory());
});

// ---------- Purchasing ----------
app.post("/purchase", (req, res) => {
  // Expecting: { costumerId, vegs: { [vegName]: amount } }  // Store expects NAME->amount
  const { costumerId, vegs } = req.body;
  if (!costumerId || !vegs || typeof vegs !== "object") {
    return res.status(400).json({ message: "costumerId and vegs (object) are required" });
    }
  const result = store.costumerPurchase(costumerId, vegs);
  if (result.success) {
    res.status(200).json({ message: result.message, total: result.total });
  } else {
    res.status(400).json({ message: result.message });
  }
});

// ---------- Reports ----------
app.get("/reports/popular", (req, res) => {
  const num = Number(req.query.num || 5);
  res.json(store.getMostPopularVeg(num));
});

app.get("/reports/low-stock", (req, res) => {
  const num = Number(req.query.num || 5);
  res.json(store.getLowestStockVeg(num));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
