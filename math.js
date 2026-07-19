// This is my custom module

function add(a, b) {
  return a + b
}

function subtract(a, b) {
  return a - b
}

function multiply(a, b) {
  return a * b
}

// Export these functions so other files can use them
module.exports = {
  add,
  subtract,
  multiply
}