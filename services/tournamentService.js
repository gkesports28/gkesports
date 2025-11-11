const { convertISTTOUTC } = require("../utils/timeUtil");

exports.getTournamentStatus =  (startTime,endTime) => {
    const currentDate = convertISTTOUTC (new Date());
        if (startTime>currentDate) {
            return "upcoming";
        } 
        else if ( startTime <= currentDate && currentDate <= endTime) {
          // console.log("Tournament is live:", tournament._id);
            return "live";
        } 
        else if (endTime < currentDate) {
          // console.log("Tournament is past:", tournament._id);
            return "past";
        }
        else {
          // console.log("No updates needed for tournament:", tournament._id);
           
        }
      }



      