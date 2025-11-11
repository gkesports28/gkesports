const express = require("express");
// const { addEsports, getEsports } = require('../controllers/esportsController')
// const image_upload = require('../middlewares/imageUpload')
const {
  addTournament,
  getTournament,
  getAllTournaments,
  updateTournament,
  updatePrizeDetails,
  updateRoomDetails,
  updateTournamentBasicDetails,
  tournamentPolling,
} = require("../controllers/TournamentController");
const image_upload = require("../middlewares/imageUpload");
const multer = require("multer");
const upload = multer();
const {
  addEsports,
  getEsports,
  updateEsports,
  deleteEsports,
} = require("../controllers/MapController");

const {
  addJoinGameModel,
  addJoinTeam,
  getTeamMembers,
  findAndJoinGame,
  findAndJoinGameTeamMember,
  joinTournament,
  getParticipants,
  teamAddMember,
  viewTeam,
  getFFCredentials,
} = require("../controllers/joinGameContoller");

const { authmidleware } = require("../middlewares/authMiddleware");
const {
  getMyLeagues,
  getTypeUpdateTypeAccordingTournament,
} = require("../controllers/myLeaguesController");
const {
  getWallet,
  addWallet,
  addWiningBalance,
  wallethistory,
  withdrawWallet,
  withdrawFromWallet,
  getWithdrawalHistory,
  distributeFunds,
  getAddFundHistory,
} = require("../controllers/WalletContoller");
const {
  updateCustom,
  nullCustomValue,
} = require("../controllers/customController");
const {
  getAllUsers,
  addMemberShipRequist,
  getMemberShipRequist,
  deleteMember,
  updateStatus,
  getSingleMember,
  getMemberCode,
  filterDateWise,
  adminFilterDateWise,
  filterDateWiseRequiest,
  getMembers,
  getUsers,
  getMembersJoinedOfMemberedUser,
} = require("../controllers/memberShipController");
// const { getTournamentWinner, updateTournamentWinner } = require('../controllers/tournamentPlayerListController')

const {
  getAllWinner,
  addWinner,
  assignWinners,
  getWinners,
  addWeeklyWinner,
  getWeeklyWinners,
  editWeekyWinner,
  removeWeeklyWinner,
} = require("../controllers/allWinnerController");
const {
  getWalletTransaction,
  getWalletAdminTransaction,
} = require("../controllers/WalletTransactionController");

const {
  addBeneficiary,
  getBeneficiaries,
  removeBeneficiary,
} = require("../controllers/beneficiaryController");
const { getOwnerPremiom } = require("../controllers/ownerPremiumController");
const {
  userDetails,
  getSingleUserDetail,
} = require("../controllers/authController");
const {
  addShipAmmount,
  getShipAmmount,
  updateShipAmmount,
} = require("../controllers/memberAmountcontroller");
const {
  requestWithdrawal,
  getWithdrawRequests,
  updateWithdrawRequestStatus,
  getWithdrawRequestsForMember,
} = require("../controllers/withdrawRequestController");
const {
  getStats,
  getTotalPayouts,
  getTotalPayments,
} = require("../controllers/dashboardController");

const EsportRoute = express.Router();

//Dashboard
EsportRoute.get("/dashboard/statistics", getStats);
EsportRoute.get("/dashboard/payments", getTotalPayments);
EsportRoute.get("/dashboard/payouts", getTotalPayouts);
EsportRoute.get("/ff-credentials", authmidleware, getFFCredentials);
//Users
EsportRoute.get("/users", userDetails);
EsportRoute.get("/users/all", getUsers);
EsportRoute.get("/users/:id", getSingleUserDetail);

EsportRoute.post("/e-sports", upload.single("gameImage"), addEsports);
EsportRoute.get("/e-sports", getEsports);
EsportRoute.put("/e-sports/:mapId", upload.single("gameImage"), updateEsports);
EsportRoute.delete("/e-sports/:mapId", deleteEsports);

EsportRoute.post("/tournaments", addTournament);
EsportRoute.get("/tournaments", getAllTournaments);
EsportRoute.get("/tournaments/:tournamentId", getTournament);
EsportRoute.put("/tournaments/:tournamentId", updateTournament);
EsportRoute.put(
  "/status-tournaments/:tournamentId",
  updateTournamentBasicDetails
);

EsportRoute.patch("/tournaments/:tournamentId/room-details", updateRoomDetails);
EsportRoute.patch(
  "/tournaments/:tournamentId/prize-details",
  updatePrizeDetails
);
EsportRoute.post(
  "/tournaments/:tournamentId/distribute-funds",
  distributeFunds
);

//Participants

EsportRoute.get("/tournaments/:tournamentId/participants", getParticipants);

// join

EsportRoute.post("/game-join", authmidleware, addJoinGameModel);
EsportRoute.get(
  "/game-join-verify/:tournamentId",
  authmidleware,
  findAndJoinGame
);
EsportRoute.post(
  "/game-join-verify-team",
  authmidleware,
  findAndJoinGameTeamMember
);
EsportRoute.post("/game-join-team", authmidleware, addJoinTeam);
EsportRoute.get("/game-join-team", authmidleware, getTeamMembers);
EsportRoute.post("/tournaments/:tournamentId/join", joinTournament);
EsportRoute.post("/tournaments/:tournamentId/teamjoin", viewTeam);

// playe join

EsportRoute.post("/player-join", authmidleware, teamAddMember);

// my leagues

EsportRoute.get("/my-league", authmidleware, getMyLeagues);
EsportRoute.get(
  "/my-league-type",
  authmidleware,
  getTypeUpdateTypeAccordingTournament
);

// wallet

EsportRoute.post("/wallet", authmidleware, addWallet);
EsportRoute.get("/wallet", authmidleware, getWallet);
EsportRoute.get("/wallet-transaction", authmidleware, getWalletTransaction);
EsportRoute.post("/winner-add", authmidleware, addWiningBalance);
EsportRoute.get("/wallet-filter", authmidleware, wallethistory);
EsportRoute.post("/wallet/withdraw-funds", authmidleware, withdrawFromWallet);
EsportRoute.get(
  "/wallet/withdraw-history",
  authmidleware,
  getWithdrawalHistory
);
EsportRoute.get("/wallet/payment-history", authmidleware, getAddFundHistory);

// admin api
EsportRoute.get("/wallet-transaction-admin/:userId", getWalletAdminTransaction);

// custom api

EsportRoute.put("/custom/:id", updateCustom);
EsportRoute.put("/custom-null/:id", nullCustomValue);

// Customer api for member feature
EsportRoute.post("/member-add", authmidleware, addMemberShipRequist);
EsportRoute.get("/member-ship-details", authmidleware, getSingleMember);
EsportRoute.get("/member-ship", authmidleware, getAllUsers);
EsportRoute.get("/member-refer", authmidleware, getMemberCode);
EsportRoute.get("/filterDateWise", authmidleware, filterDateWise);

// admin api for member feature
EsportRoute.get("/membership-requests", getMemberShipRequist);
EsportRoute.put("/membership-requests/status/:id", updateStatus);
EsportRoute.put("/membership-requests/:id", deleteMember);
EsportRoute.get("/member-filter/:date", adminFilterDateWise);
EsportRoute.get("/member-filter-requist/:date", filterDateWiseRequiest);

EsportRoute.get("/members", authmidleware, getMembers);
EsportRoute.get(
  "/membered-users/members",
  authmidleware,
  getMembersJoinedOfMemberedUser
);
EsportRoute.post("/shipAmount", addShipAmmount);
EsportRoute.get("/shipAmount", getShipAmmount);
EsportRoute.put("/shipAmount/:id", updateShipAmmount);

// tournament player

// EsportRoute.get('/tournament-player/:tournamentId',getTournamentWinner)
// EsportRoute.put('/tournament-player/:tournamentId',updateTournamentWinner)

// all winner

EsportRoute.post("/winner-list", addWeeklyWinner);
EsportRoute.get("/winner-list", getWeeklyWinners);
EsportRoute.put("/winner-list/edit/:id", editWeekyWinner);
EsportRoute.delete("/winner-list/delete/:id", removeWeeklyWinner);
// EsportRoute.put('/winner-list/:tournamentId',getAllWinner)
EsportRoute.post("/tournaments/:tournamentId/winners", assignWinners);
EsportRoute.get("/tournaments/:tournamentId/winners", getWinners);

//beneficiary Routes
EsportRoute.post("/beneficiaries", authmidleware, addBeneficiary);
EsportRoute.delete("/beneficiaries/:id", authmidleware, removeBeneficiary);
EsportRoute.get("/beneficiaries", authmidleware, getBeneficiaries);

// owner contact verify

EsportRoute.get("/tournament-notification", tournamentPolling);

// withdraw member ship

EsportRoute.post("/withdraw-request", authmidleware, requestWithdrawal);
EsportRoute.get(
  "/withdraw-request",
  authmidleware,
  getWithdrawRequestsForMember
);

// admin api

EsportRoute.get("/withdraw-request-admin", getWithdrawRequests);
EsportRoute.put(
  "/withdraw-request-admin/status/:id",
  updateWithdrawRequestStatus
);
// EsportRoute.get('/withdraw-request-admin/:userName',searchMemberShipRequist)
// EsportRoute.get('/withdraw-request-admin-date/:date',dateSearchEntry)

EsportRoute.get("/owner-premium", authmidleware, getOwnerPremiom);

module.exports = EsportRoute;
