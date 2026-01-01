const express = require("express");
const cors = require("cors");
const path = require("path");
const LoginRoute = require("./routes/authRoutes");
const EsportRoute = require("./routes/esportsRoutes");
const CashFreePaymentRoute = require("./routes/cahfreePaymentRoutes");
const CashFreePayoutRoute = require("./routes/cashfreePayoutRoutes");
// const path = require('path');
const { sendGlobalNotification } = require("./config/fcmConfig");
// require("./scheduler/tournament");
const app = express();
const corsOptions = {
  "Access-Control-Allow-Origin": [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://esports.gamingkhel.com",
    "https://admin.gkmsinfotech.com",
    "https://admin.gkmsinfotech.com/",
    "https://gkmsinfotech.com",
    "http://89.116.33.43",
  ],
  "Access-Control-Allow-Credentials": true,
  "Access-Control-Allow-Methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  "Access-Control-Allow-Headers": [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/image", express.static(__dirname + "/public/image"));

//Default Route
const notificationDataBody = {
  title: "this is title",
  price: "2000",
  fee: "10",
  start: "2025-07-26T08:05:26.746+00:00",
  end: "2025-08-26T08:05:26.746+00:00",
};

// Function to format date into readable format
const formatDate = (isoString) => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(date);
};

const str = `🎮: ${notificationDataBody.title}\n 🏆: Prize Pool: ₹${notificationDataBody.price}\n 💰: Entry Fee: ₹${notificationDataBody.fee}\n ⏰: Start: ${formatDate(notificationDataBody.start)}\n 🏁: End: ${formatDate(notificationDataBody.end)}`;
// sendGlobalNotification("global title", str, notificationDataBody);

// app.use('/', express.static(path.join(__dirname, 'build')));
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });

// // 🟠 Serve admin app or second React build
// app.use('/main', express.static(path.join(__dirname, 'buildd')));
// app.get('/main/*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'buildd', 'index.html'));
// });
//Routes
app.use("/auth/v1/gk", LoginRoute);
app.use("/auth/v1/gk/game", EsportRoute);
app.use("/auth/v1/gk/payment", CashFreePaymentRoute);
app.use("/auth/v1/gk/payout", CashFreePayoutRoute);

//Error Handling Middleware
//Example to handle 404
app.get("/", (req, res, next) => {
  res.send("<h1>Server Running</h1>");
});
app.get("/test", (req, res, next) => {
  res.sendFile(path.join(__dirname, "templates", "pay-test.html"));
});
app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});

//Example error handling
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
module.exports = app;
