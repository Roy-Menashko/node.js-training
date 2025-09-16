// classes/vegetables.js
// Vegetable entity (inventory item).
class Vegetable {
  constructor(name, id, amount, price) {
    this.name = name;                 // display name (not the key)
    this.id = id;                     // unique id (used as key)
    this.amount = Number(amount);     // current stock
    this.price = Number(price);       // unit price
    this.sold = 0;                    // total sold units
  }

  // sales counters
  addSold(amount) { this.sold += Number(amount); }
  getSold() { return this.sold; }

  // getters
  getPrice() { return this.price; }
  getAmount() { return this.amount; }
  getName() { return this.name; }
  getId() { return this.id; }

  // mutators
  setAmount(amount) { this.amount = Number(amount); }
  setPrice(price) { this.price = Number(price); }
}

module.exports = Vegetable;
