// Backend Configuration
const dotenv = require('dotenv');
dotenv.config();

const MODE = process.env.APP_MODE || "COLLEGE"; // "COLLEGE", "APARTMENT", "EVENT"

const getAppConfig = () => {
    switch (MODE) {
        case "APARTMENT":
            return {
                APP_NAME: process.env.APP_NAME || "MyResidenz",
                ID_LABEL: "Flat Number",
                EXTRA_FIELDS: ["block_number", "resident_type"],
                REQUIRED_FIELDS: ["flat_number", "block_number", "resident_type"]
            };
        case "EVENT":
            return {
                APP_NAME: process.env.APP_NAME || "EventPark",
                ID_LABEL: "Ticket ID",
                EXTRA_FIELDS: ["event_pass_type", "access_level"],
                REQUIRED_FIELDS: ["ticket_id", "event_pass_type"]
            };
        default: // COLLEGE
            return {
                APP_NAME: process.env.APP_NAME || "UniPark",
                ID_LABEL: "Member ID", // Roll Number
                EXTRA_FIELDS: ["department"],
                REQUIRED_FIELDS: ["member_id", "department"]
            };
    }
};

module.exports = {
    MODE,
    APP_CONFIG: getAppConfig()
};
