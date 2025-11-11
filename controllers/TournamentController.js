const { sendGlobalNotification, mapDataToString } = require("../config/fcmConfig");
const EsportsModel = require("../models/MapModel");
const TournamentModel = require("../models/TournamentModel");
const { getTournamentStatus } = require("../services/tournamentService");
const { convertISTTOUTC } = require("../utils/timeUtil");
const playerSize = {
  'solo': 1,
  'duo': 2,
  'squad': 4, 
}

exports.addTournament = async (req, res) => {
  console.log(req.body, "add data");
  const data = req.body;
  const totalPlayers = playerSize[data.type] * data.totalParticipants;
  const startTime = convertISTTOUTC(data.startTime);
  const endTime = convertISTTOUTC(data.endTime);
  if (startTime > endTime) { return res.json({ status: "fail", message: "Start time should be less than end time" }); }

  try {

    const objData = {
      type: data.type,
      title: data.title,
      entryFee: data.entryFee,
      prizes: data.killPoint * (totalPlayers - 1),
      killPoint: data.killPoint,
      startTime: convertISTTOUTC(data.startTime),
      endTime: convertISTTOUTC(data.endTime),
      totalParticipants: data.totalParticipants,
      map: data.map,
      filled: data.filled,
      totalPlayer: data.totalPlayer,
      startDate: data.startDate,
      mapId: data.mapId,
      prizeDetail: data.prizeDetail,
    };

    const addData = await TournamentModel.create(objData);

    if (addData) {

      const notificationDataBody = {
        title: addData.title,
        price: addData.prizes,
        fee: addData.entryFee,
        start: addData.startTime,
        end: addData.endTime,
      };

      // Function to format date into readable format
      const formatDate = (isoString) => {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: 'Asia/Kolkata',
        }).format(date);
      };

      // sendGlobalNotification(objData.map, JSON.stringify(notificationDataBody));  
      const str = `🎮: ${notificationDataBody.title}\n 🏆: Prize Pool: ₹${notificationDataBody.price}\n 💰: Entry Fee: ₹${notificationDataBody.fee}\n ⏰: Start: ${formatDate(notificationDataBody.start)}\n 🏁: End: ${formatDate(notificationDataBody.end)}`;
      sendGlobalNotification(objData.map, str, notificationDataBody);

      res.json({ status: "success", message: "Tournament added successfully" });
    } else {
      res.json({ status: "fail", message: "Failed to add tournament" });
    }
  } catch (error) {
    res.json({ status: "error", message: "Error adding tournament", error: error.message });
  }
};


exports.getAllTournaments = async (req, res) => {

  const { search, type, status, mapId } = req.query;
  const types = type ? type.split(",") : [];
  const statuses = status ? status.split(",") : [];

  try {
    // Build the MongoDB query object
    let query = {};
    let sort = { startTime: 1 }; // Default sort by updatedAt in descending order

    if (mapId) query.mapId = mapId;

    if (types.length > 0) {
      query.type = { $in: types }; // Match any type in the array (e.g., ['solo', 'duo'])
    }

    if (statuses.length > 0) {
      query.status = { $in: statuses }; // Match any status in the array (e.g., ['past', 'upcoming'])
    }

    if (query.status === "upcoming") {
      sort = { startTime: -1 }
    }

    else if (query.status === "live") {
      sort = { startTime: -1 }
    }

    else if (query.status === "past") {
      sort = { startTime: -1 }
    }

    if (search) query.title = new RegExp(search, "i");
    if (mapId) query.mapId = mapId;

    const getAllTournaments = await TournamentModel.find(query).sort(sort).populate({ path: "mapId", model: EsportsModel });

    if (getAllTournaments.length > 0) {
      res.json({ status: "success", message: "Get success", data: getAllTournaments });
    } else {
      res.json({ status: "fail", data: [], message: "No tournaments found" });
    }
  } catch (error) {
    res.json({ status: "error", message: "Error fetching tournaments", error: error.message });
  }
};

exports.getTournament = async (req, res) => {
  const id = req.params.tournamentId;

  try {

    const tournament = await TournamentModel.findOne({ _id: id }).populate({ path: "mapId", model: EsportsModel });
    if (tournament) {
      res.json({ status: "success", message: "Tournament Found successfully", data: tournament });
    } else {
      res.json({ status: "fail", message: "No Data Found" });
    }
  } catch (error) {
    res.json({ status: "error", message: "Error fetching tournament", error: error.message });
  }
};

exports.updateTournament = async (req, res) => {
  const tournamentId = req.params.tournamentId;
  const data = req.body;
  console.log(data, data.type, "Data");
  console.log(convertISTTOUTC, "convertISTTOUTC");

  try {

    let tournament = await TournamentModel.findOne({ _id: tournamentId });
    const totalPlayers = playerSize[data.type] * data.totalParticipants;
    const prizePool = tournament.prizeDetail.reduce((acc, item) => acc + (item.maxPosition - item.minPosition + 1) * item.prize, 0) || 0;

    if (data.startTime > data.endTime) { return res.json({ status: "fail", message: "Start time should be less than end time" }); }

    let startTime = convertISTTOUTC(data.startTime);
    let endTime = convertISTTOUTC(data.endTime);

    const tournamentStatus = getTournamentStatus(startTime, endTime);

    const objData = {
      title: data.title,
      startTime,
      endTime,
      killPoint: data.killPoint,
      prizes: prizePool + data.killPoint * (totalPlayers - 1),
      status: tournamentStatus,
    }

    const findTournament = await TournamentModel.findOneAndUpdate({ _id: tournamentId }, objData, { new: true });

    if (!findTournament) { return res.status(400).json({ status: "fail", message: "Error in updating tournament" }); }

    return res.status(200).json({ status: "success", message: "Tournament Updated Successfully", data: findTournament });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: "Error in updating tournament", error: error.message });
  }
};

exports.updateRoomDetails = async (req, res) => {
  const data = req.body;
  const { tournamentId } = req.params;

  const objData = {
    customId: data.customId,
    custompassword: data.custompassword,
  };

  try {

    const addData = await TournamentModel.findOneAndUpdate({ _id: tournamentId }, objData, { new: true });

    if (addData) {
      res.json({ status: "success", message: "Room Detail Updated Succesfully" });
    } else {
      res.json({ status: "fail" });
    }

  } catch (error) {
    res.json({ error });
  }
};

exports.updatePrizeDetails = async (req, res) => {
  const { tournamentId } = req.params;
  const data = req.body;
  let prizePool = 0;
  prizePool += data.reduce((acc, item) => acc + (item.maxPosition - item.minPosition + 1) * item.prize, 0);
  console.log(prizePool);
  try {
    const updatedTournament = await TournamentModel.findOneAndUpdate({ _id: tournamentId }, { prizeDetail: data }, { new: true });

    console.log(updatedTournament);

    updatedTournament.prizes = updatedTournament.killPoint * (updatedTournament.totalParticipants - 1) + prizePool;
    await updatedTournament.save();

    if (!updatedTournament)
      return res.json({
        status: "fail",
        message: "Error in updating Prize Details",
      });

    return res.json({
      status: "success",
      message: "Prize Detail updated Successfully",
    });
  } catch (e) {
    res.json({ status: "fail", message: e.message });
  }
};




exports.updateTournamentBasicDetails = async (req, res) => {
  try {
    const tournamentId = req.params.tournamentId;
    const { status } = req.body;

    const updatedTournament = await TournamentModel.findOneAndUpdate(
      { _id: tournamentId },
      { status },
      { new: true }
    );

    if (!updatedTournament) {
      return res.status(400).json({
        status: "fail",
        message: "Tournament not found or not updated",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Tournament details updated successfully",
      data: updatedTournament,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.tournamentPolling = async (req, res) => {
  try {

    const latestTournament = await TournamentModel.find().sort({ createdAt: -1 }).limit(1);

    return res.status(200).json({ status: "success", latestTournament: latestTournament });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: "error", message: "Internal server error", error: error.message });
  }
};
