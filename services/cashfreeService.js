const { default: axios } = require("axios");

require("dotenv").config();
const clientId = process.env.PAYMENT_CLIENT_ID;
const clientSecret = process.env.PAYMENT_CLIENT_SECRET;
console.log(clientId, clientSecret);
exports.createOrder = async function createOrder(
  orderId,
  amount,
  customerId,
  customerName,
  customerEmail,
  customerPhone
) {
  const orderData = {
    order_id: orderId,
    order_amount: amount,
    order_currency: "INR",
    customer_id: customerId,
    customer_name: customerName,
    order_email: customerEmail,
    order_phone: customerPhone,
  };
  console.log(orderData, "order");
  try {
    const response = await axios.post(
      "https://api.cashfree.com/api/v2/order/create",
      orderData,
      {
        headers: {
          "x-client-id": clientId,
          "x-client-secret": clientSecret,
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating order:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

exports.generatePaymentUrl = async function generatePaymentUrl(
  orderId,
  amount,
  orderNote,
  customerEmail,
  customerPhone,
  redirectUrl
) {
  const checkoutData = {
    order_id: orderId,
    order_amount: amount,
    order_currency: "INR",
    order_note: orderNote,
    order_email: customerEmail,
    order_phone: customerPhone,
    payment_mode: "NB", // You can specify preferred payment mode here, e.g., 'NB' for Net Banking, 'DC' for Debit Cards, etc.
    redirect_url: redirectUrl, // Your redirect URL after payment completion
  };
  try {
    const response = await axios.post(
      "https://api.cashfree.com/api/v2/checkout/payment",
      checkoutData,
      {
        headers: {
          "x-client-id": clientId,
          "x-client-secret": clientSecret,
        },
      }
    );
    if (response.data.status === "SUCCESS") {
      return response.data.payment_url; // This is the URL to load in the web view
    } else {
      throw new Error("Failed to generate payment URL");
    }
  } catch (error) {
    console.error(
      "Error generating payment URL:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};
