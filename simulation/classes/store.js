// classes/store.js
// In-memory store: maps + a price-sorted array for O(1) min/max by price.
const Customer = require("./costumers"); // file name kept; exports Customer class
const Order = require("./order");
const Vegetable = require("./vegetables");

class Store {
  constructor() {
    this.vegetables = new Map(); // id(string) -> Vegetable
    this.customers = new Map();  // id(string) -> Customer
    this.sortedVeg = [];         // array<Vegetable> sorted by price ASC
  }

  // --- Helpers ---
  _idKey(id) { return String(id); }

  // binary lower_bound by price (stable position for equal prices)
  _lowerBoundByPrice(price) {
    let lo = 0, hi = this.sortedVeg.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.sortedVeg[mid].getPrice() < price) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  // --- Vegetables CRUD ---
  addVegetable(veg) {
    if (!(veg instanceof Vegetable)) {
      throw new Error("addVegetable expects a Vegetable instance");
    }
    const key = this._idKey(veg.getId());
    const existing = this.vegetables.get(key);

    // if replacing existing, remove old from the sorted array
    if (existing) {
      this.sortedVeg = this.sortedVeg.filter(v => v.getId() !== existing.getId());
    }

    this.vegetables.set(key, veg);

    // insert into sorted array by price
    const idx = this._lowerBoundByPrice(veg.getPrice());
    this.sortedVeg.splice(idx, 0, veg);
  }

  updateVegetablePrice(id, newPrice) {
    const key = this._idKey(id);
    const v = this.vegetables.get(key);
    if (!v) return { success: false, message: "Vegetable not found" };

    // remove from current position, update, reinsert by price
    this.sortedVeg = this.sortedVeg.filter(x => x.getId() !== v.getId());
    v.setPrice(newPrice);
    const idx = this._lowerBoundByPrice(v.getPrice());
    this.sortedVeg.splice(idx, 0, v);
    return { success: true };
  }

  removeVegetable(id) {
    const key = this._idKey(id);
    const v = this.vegetables.get(key);
    if (!v) return { success: false, message: "Vegetable not found" };
    this.vegetables.delete(key);
    this.sortedVeg = this.sortedVeg.filter(x => x.getId() !== v.getId());
    return { success: true, message: "Vegetable removed" };
  }

  getAllVegetables() { return Array.from(this.vegetables.values()); }
  getCheapestVeg() { return this.sortedVeg.length ? this.sortedVeg[0] : null; }
  getMostExpensiveVeg() {
    return this.sortedVeg.length ? this.sortedVeg[this.sortedVeg.length - 1] : null;
  }
  getSortedVeg() { return this.sortedVeg.slice(); } // return a copy

  // --- Customers CRUD ---
  addCustomer(customer) {
    if (!(customer instanceof Customer)) {
      throw new Error("addCustomer expects a Customer instance");
    }
    const key = this._idKey(customer.getId());
    this.customers.set(key, customer);
  }
  getAllCustomers() { return Array.from(this.customers.values()); }

  // --- Purchasing workflow ---
  // vegs: plain object { [vegId]: amount }
  purchase(customerId, vegs) {
    const cKey = this._idKey(customerId);
    const customer = this.customers.get(cKey);
    if (!customer) return { success: false, message: "Customer not found" };
    if (!vegs || typeof vegs !== "object")
      return { success: false, message: "Invalid 'vegs' payload" };

    // 1) Validate availability (no partial updates)
    for (const vegId in vegs) {
      const key = this._idKey(vegId);
      const amount = Number(vegs[vegId]);
      const veg = this.vegetables.get(key);
      if (!veg) {
        return { success: false, message: `Vegetable ${vegId} not found` };
      }
      if (veg.getAmount() < amount) {
        return { success: false, message: `Insufficient stock for ${veg.getName()}` };
      }
    }

    // 2) Apply updates atomically
    let total = 0;
    const order = new Order();
    for (const vegId in vegs) {
      const key = this._idKey(vegs.hasOwnProperty(vegId) ? vegId : String(vegId));
      const amount = Number(vegs[vegId]);
      const veg = this.vegetables.get(key);

      veg.setAmount(veg.getAmount() - amount);
      veg.addSold(amount);
      total += veg.getPrice() * amount;

      order.addToOrder(key, amount);
    }
    order.setTotal(total);
    customer.addToHistory(order);
    customer.addMoneySpent(total);

    return { success: true, message: "Purchase successful", total };
  }

  // --- Reports ---
  getBestCustomers(n) {
    return Array.from(this.customers.values())
      .sort((a, b) => b.getMoneySpent() - a.getMoneySpent())
      .slice(0, Number(n));
  }

  getMostPopularVeg(n) {
    return Array.from(this.vegetables.values())
      .sort((a, b) => b.getSold() - a.getSold())
      .slice(0, Number(n));
  }

  getLowestStockVeg(n) {
    return Array.from(this.vegetables.values())
      .sort((a, b) => a.getAmount() - b.getAmount())
      .slice(0, Number(n));
  }
}

module.exports = Store;
