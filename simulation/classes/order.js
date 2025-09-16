// classes/order.js
// Simple order aggregate: itemId -> quantity, plus computed total.
class Order {
  constructor() {
    this.order = {}; // { [vegetableId]: amount }
    this.total = 0;  // computed checkout total
  }
  addToOrder(id, amount) {
    // accumulate amounts instead of overwriting
    this.order[id] = (this.order[id] || 0) + Number(amount);
  }
  getOrders() {
    return this.order; // returns the raw map
  }
  getTotal() {
    return this.total;
  }
  setTotal(total) {
    this.total = Number(total);
  }
}

module.exports = Order;
