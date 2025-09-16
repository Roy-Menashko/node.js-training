// classes/costumers.js
// Customer entity + minimal purchase history.
const Order = require("./order");

class Customer {
  constructor(id, name, phone) {
    this.id = id;             // unique customer id (string/number)
    this.name = name;         // display name
    this.phone = phone;       // phone number as string
    this.cart = new Order();  // temporary cart (optional usage)
    this.history = [];        // array<Order>
    this.moneySpent = 0;      // total lifetime spend
  }

  // getters
  getId() { return this.id; }
  getName() { return this.name; }
  getPhone() { return this.phone; }
  getCart() { return this.cart; }
  getMoneySpent() { return this.moneySpent; }
  getHistory() { return this.history; }

  // create a new cart from a plain object: { [vegId]: amount }
  makeOrder(items) {
    this.cart = new Order();                    // reset cart
    for (const vegId in items) {
      const amount = Number(items[vegId]);
      this.cart.addToOrder(vegId, amount);
    }
  }

  addToHistory(order) { this.history.push(order); }
  addMoneySpent(amount) { this.moneySpent += Number(amount); }

  // basic mutators
  setName(name) { this.name = name; }
  setPhone(phone) { this.phone = phone; }
}

module.exports = Customer;
