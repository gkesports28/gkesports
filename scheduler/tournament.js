const cron = require("node-cron");
const TournamentModel = require("../models/TournamentModel");
const { convertISTTOUTC } = require("../utils/timeUtil");

cron.schedule(
  "* * * * *", // Runs every minute
  async () => {
    console.log("Scheduler Running Every Minute for Tournament Status Update", new Date().getSeconds());

    try {
      // Get the current time in UTC
      const currentDate = new Date(); // No need to convert current time, cron runs in UTC
      console.log("Current UTC Time:", currentDate);

      // Fetch tournaments that are either "live", "upcoming", or "past"
      const tournaments = await TournamentModel.find(
        { status: { $in: ["past", "live", "upcoming"] } },
        { startTime: 1, endTime: 1, status: 1 } // Select only required fields
      );

      for (const tournament of tournaments) {
        const startTime = new Date(tournament.startTime); // Assuming startTime and endTime are stored in UTC
        const endTime = new Date(tournament.endTime); // Assuming endTime is stored in UTC
        console.log("Tournament Start Time:", startTime);
        console.log("Tournament End Time:", endTime);

        // Check if the tournament's status should be updated
        if (startTime > currentDate) {
          if (tournament.status !== "upcoming") {
            await TournamentModel.findByIdAndUpdate(tournament._id, { status: "upcoming" });
            console.log(`Tournament ${tournament._id} status updated to "upcoming"`);
          }
        } else if (startTime <= currentDate && currentDate <= endTime) {
          if (tournament.status !== "live") {
            await TournamentModel.findByIdAndUpdate(tournament._id, { status: "live" });
            console.log(`Tournament ${tournament._id} status updated to "live"`);
          }
        } else if (endTime < currentDate) {
          if (tournament.status !== "past") {
            await TournamentModel.findByIdAndUpdate(tournament._id, { status: "past" });
            console.log(`Tournament ${tournament._id} status updated to "past"`);
          }
        } else {
          console.log("No updates needed for tournament:", tournament._id);
        }
      }
    } catch (error) {
      console.error("Error in scheduler:", error);
    }
  },
  { scheduled: true, timezone: "Asia/Kolkata" }
);












// const cron = require("node-cron");
// const TournamentModel = require("../models/TournamentModel");
// const { convertISTTOUTC } = require("../utils/timeUtil");

// cron.schedule(
//   "* * * * *", // Runs every minute
//   async () => {
//     console.log("Scheduler Running Evert Second for Tournament Status Update", new Date().getSeconds());

//     try {
//       // Get the current time in IST
//       const currentDate =convertISTTOUTC(new Date());
//       console.log(currentDate, "Current IST Date");

//       // Fetch tournaments that are either "live" or "upcoming"
//       const tournaments = await TournamentModel.find(
//         { status: { $in: ["past","live", "upcoming"] } },
//         { startTime: 1, endTime: 1, status: 1 } // Select only required fields
//       );

//       for (const tournament of tournaments) {
//         const startTime = convertISTTOUTC(tournament.startTime);
//         const endTime = convertISTTOUTC(tournament.endTime);

//         // console.log(startTime, endTime, currentDate, "Tournament Time Check");

//         if (startTime>currentDate) {
//           // console.log("Tournament is upcoming:", tournament._id);
//           await TournamentModel.findByIdAndUpdate(tournament._id, { status: "upcoming" });
//         } 
//         else if ( startTime <= currentDate && currentDate <= endTime) {
//           // console.log("Tournament is live:", tournament._id);
//           await TournamentModel.findByIdAndUpdate(tournament._id, { status: "live" });
//         } 
//         else if (endTime < currentDate) {
//           // console.log("Tournament is past:", tournament._id);
//           if(tournament.status !== "past") {
//             console.log("Updating tournament status to past:", tournament._id);
//           }
//           await TournamentModel.findByIdAndUpdate(tournament._id, { status: "past" });
//         }
//         else {
//           console.log("No updates needed for tournament:", tournament._id);
//         }
//       }
//     } catch (error) {
//       console.error("Error in scheduler:", error);
//     }
//   },
//   { scheduled: true, timezone: "Asia/Kolkata" }
// );
