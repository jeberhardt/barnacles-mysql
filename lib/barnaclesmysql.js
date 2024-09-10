/**
 * Copyright reelyActive 2023-2024
 * We believe in an open Internet of Things
 */

const mysql = require("mysql2");

const DEFAULT_MYSQL_HOST = "localhost";

const DEFAULT_PRINT_ERRORS = false;
const DEFAULT_RADDEC_OPTIONS = { includePackets: false };
const DEFAULT_DYNAMB_OPTIONS = {};
const DEFAULT_EVENTS_TO_STORE = {
  raddec: DEFAULT_RADDEC_OPTIONS,
  dynamb: DEFAULT_DYNAMB_OPTIONS,
};
const SUPPORTED_EVENTS = ["raddec", "dynamb"];
const RADDEC_MEASUREMENT = "raddec";
const DYNAMB_MEASUREMENT = "dynamb";

let connection;

/**
 * BarnaclesMySQL Class
 * Reveives events and writes to MySQL.
 */
class BarnaclesMySQL {
  /**
   * BarnaclesMySQL constructor
   * @param {Object} options The options as a JSON object.
   * @constructor
   */
  constructor(options) {
    let self = this;
    options = options || {};

    this.printErrors = options.printErrors || DEFAULT_PRINT_ERRORS;
    this.eventsToStore = {};
    let eventsToStore = options.eventsToStore || DEFAULT_EVENTS_TO_STORE;

    for (const event in eventsToStore) {
      let isSupportedEvent = SUPPORTED_EVENTS.includes(event);

      if (isSupportedEvent) {
        self.eventsToStore[event] =
          eventsToStore[event] || DEFAULT_EVENTS_TO_STORE[event];
      }
    }

    this.connection = options.mysqlConnection || createMySQLConnection(options);

    this.connection.connect(function (err) {
      if (err) {
        console.error("Error connecting to MySQL: " + err.stack);
      }
      console.debug("Connected to MySQL");
    });
  }

  /**
   * Handle an outbound event.
   * @param {String} name The outbound event name.
   * @param {Object} data The outbound event data.
   */
  handleEvent(name, data, callback) {
    let self = this;
    let isEventToStore = self.eventsToStore.hasOwnProperty(name);

    if (isEventToStore) {
      switch (name) {
        case "dynamb":
          handleDynamb(self, data, callback);
      }
    }
  }
}

/**
 * Handle the given dynamb by storing it in MySQL.
 * @param {Ojbect} instance The MySQL instance.
 * @param {Object} dynamb The dynamb data.
 */
function handleDynamb(instance, dynamb, callback) {
  let message = JSON.stringify(dynamb);
  instance.connection.query(
    "INSERT INTO dynamb SET ?",
    { dynamb: message },
    function (error, results, fields) {
      handleDynambQueryResult(error, results, fields, dynamb, callback);
    }
  );
}

function handleDynambQueryResult(error, results, fields, dynamb, callback) {
  if (error) throw error;
  // emit event
  // add insertId to the dynamb message
  let mysqlId = { mysqlId: results.insertId };
  dynamb = Object.assign(dynamb, mysqlId);
  console.log(dynamb);
  if (callback && typeof callback === "function") {
    callback("dynamb", dynamb);
  }
}

let createMySQLConnection = (options) => {
  let host = options.host || DEFAULT_MYSQL_HOST;
  let user = options.user || process.env.MYSQL_USER;
  let password = options.password || process.env.MYSQL_PASSWORD;

  if (!user || !password) {
    throw new Error("MySQL `user` and `password` must be provided");
  }

  let connection = mysql.createConnection({
    host: host,
    user: user,
    password: password,
    database: "sys",
  });

  return connection;
};

module.exports = BarnaclesMySQL;
