const neo4j = require("neo4j-driver");
require("dotenv").config();

const uri = process.env.DB_CONNECTION;

const user = process.env.DB_USER;

const password = process.env.DB_PASSWORD;
const modeller = require("neo4j-node-ogm");
const database = modeller.getConnection();
// To learn more about the driver: https://neo4j.com/docs/javascript-manual/current/client-applications/#js-driver-driver-object

/**
 * 
 * @returns Gives back a session for query execution
 */
 const connection = () => {
    return database.session()
}
/**
 * Close kills the driver connection and all sessions associated with it
 */
const close = async()=>{
    await database.close()
}

module.exports ={
    close,
    connection
}
