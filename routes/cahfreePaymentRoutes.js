const express = require('express')
const {  verifyPayment, createPaymentSession,getPaymentSession, paymentWebhook } = require('../controllers/cashfreeController')
const { authmidleware } = require('../middlewares/authMiddleware')
const CashFreeRoute = express.Router()

//For Web view 
// Step:1
CashFreeRoute.post("/cashfree/create-payment-session",authmidleware,createPaymentSession)
//Step:2
CashFreeRoute.get("/cashfree/get-payment-session",getPaymentSession)
CashFreeRoute.post('/cashfree/verify-payment/:paymentSessionId',verifyPayment)
CashFreeRoute.post("/webhook",paymentWebhook)

//For React Native SDK
// CashFreeRoute.post('/cashfree/create-order',authmidleware,createOrder)
// CashFreeRoute.post('/cashfree/verify-payment/:orderId',verifyPayment)
// CashFreeRoute.post('/cashfree/verifyOwnerContect/:amount',authmidleware,contactPayment)




module.exports = CashFreeRoute