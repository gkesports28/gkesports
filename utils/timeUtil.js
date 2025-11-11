const moment = require('moment-timezone');

const convertISTTOUTC = (date) => {
    if (!date) return null;
    // Convert IST to UTC using moment-timezone
    const utcDate = moment.tz(date, 'Asia/Kolkata').utc().toDate();

    return utcDate;
};  
module.exports = { convertISTTOUTC };