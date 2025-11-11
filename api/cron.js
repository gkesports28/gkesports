const TournamentModel = require("../models/TournamentModel");
const { convertISTTOUTC } =require("../utils/timeUtil");
export default async function handler(req, res) {
    // if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return res.status(401).end('Unauthorized');
    //   }
        console.log("Scheduler Running");
      
          try {
            // Get the current time in IST
            const currentDate =convertISTTOUTC(new Date());
            console.log(currentDate, "Current IST Date");
      
            // Fetch tournaments that are either "live" or "upcoming"
            const tournaments = await TournamentModel.find(
              { status: { $in: ["past","live", "upcoming"] } },
              { startTime: 1, endTime: 1, status: 1 } // Select only required fields
            );
      
            for (const tournament of tournaments) {
            
                const startTime = convertISTTOUTC(tournament.startTime);
                const endTime = convertISTTOUTC(tournament.endTime);
        
                console.log(startTime, endTime, currentDate, "Tournament Time Check");
        
                if (startTime>currentDate) {
                  console.log("Tournament is upcoming:", tournament._id);
                  await TournamentModel.findByIdAndUpdate(tournament._id, { status: "upcoming" });
                } 
                else if ( startTime <= currentDate && currentDate <= endTime) {
                  console.log("Tournament is live:", tournament._id);
                  await TournamentModel.findByIdAndUpdate(tournament._id, { status: "live" });
                } 
                else if (endTime < currentDate) {
                  console.log("Tournament is past:", tournament._id);
                  await TournamentModel.findByIdAndUpdate(tournament._id, { status: "past" });
                }
                else {
                  console.log("No updates needed for tournament:", tournament._id);
                }
              }
            
            return res.status(200).end('Hello Cron!');
          } catch (error) {
            console.error("Error in scheduler:", error);
            res.status(500).end('Internal Server Error');
          }
  }