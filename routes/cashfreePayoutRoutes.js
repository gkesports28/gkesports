const express = require('express')
const {  payoutWebhook, withdrawFunds } = require('../controllers/cashfreeController')
const { authmidleware } = require('../middlewares/authMiddleware')
const CashFreePayoutRoute = express.Router()


//Payout Route
CashFreePayoutRoute.post('/webhook',payoutWebhook)
CashFreePayoutRoute.post('/withdraw',authmidleware,withdrawFunds)

module.exports = CashFreePayoutRoute