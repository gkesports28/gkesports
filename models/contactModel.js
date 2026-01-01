const { default: mongoose } = require("mongoose");

const contactSchema = new mongoose.Schema({
  email: {
    type: String,
    default: null,
  },
  customer_care: {
    type: String,
    default: null,
  },
  manager_number: {
    type: String,
    default: null,
  },
});

const contactModel = mongoose.model("contact", contactSchema);
module.exports = contactModel;
