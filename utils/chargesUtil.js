const pgChargesData = [ 
    { start: 30, end: 60, pg_charges: 4 },
    { start: 61, end: 120, pg_charges: 6 },
    { start: 121, end: 200, pg_charges: 9 },
    { start: 201, end: 300, pg_charges: 12 },
    { start: 301, end: 400, pg_charges: 15 },
    { start: 401, end: 500, pg_charges: 18 },
    { start: 501, end: 600, pg_charges: 21 },
    { start: 601, end: 700, pg_charges: 24 },
    { start: 701, end: 800, pg_charges: 27 },
    { start: 901, end: 1000, pg_charges: 30 },
    { start: 1001, end: 2000, pg_charges: 40 },
    { start: 2001, end: 3000, pg_charges: 50 },
    { start: 3001, end: 4000, pg_charges: 60 },
    { start: 4001, end: 5000, pg_charges: 70 },
    { start: 5001, end: 6000, pg_charges: 80 },
    { start: 6001, end: 7000, pg_charges: 90 },
    { start: 7001, end: 8000, pg_charges: 100 },
    { start: 8001, end: 9000, pg_charges: 110 },
    { start: 9001, end: 10000, pg_charges: 120 },
    { start: 10001, end: 11000, pg_charges: 130 },
    { start: 11001, end: 12000, pg_charges: 140 },
    { start: 12001, end: 13000, pg_charges: 150 },
    { start: 13001, end: 14000, pg_charges: 160 },
    { start: 14001, end: 15000, pg_charges: 170 },
    { start: 15001, end: 16000, pg_charges: 180 },
    { start: 16001, end: 17000, pg_charges: 190 },
    { start: 17001, end: 18000, pg_charges: 200 },
    { start: 18001, end: 19000, pg_charges: 210 },
    { start: 19001, end: 20000, pg_charges: 220 },
    { start: 20001, end: 21000, pg_charges: 230 },
    { start: 21001, end: 22000, pg_charges: 240 },
    { start: 22001, end: 23000, pg_charges: 250 },
    { start: 23001, end: 24000, pg_charges: 260 },
    { start: 24001, end: 25000, pg_charges: 270 },
];

const calculatePayoutCharges = (amount) => {
    const chargeData = pgChargesData.find(range => amount >= range.start && amount <= range.end);
    return chargeData ? chargeData.pg_charges : 0; // Return 0 if no matching range is found
};

module.exports = { calculatePayoutCharges };