import { sequelize, connectToDB, createTables, syncTables } from "./db.js"
import { ApolloServer, AuthenticationError  } from "apollo-server"
import { typeDefs } from "./schema/type-defs.js"
import { resolvers } from "./schema/resolvers.js"
import { downloadFileFromStorage, } from "./azure_storage.js"
import { storeAllProductDataInRedis, removeAllProductDataInRedis, productSchema } from "./redis.js"
import { verifyJwt } from "./utils.js"
import cron from 'node-cron';
import * as fs from 'fs';
const PORT = process.env.PORT || 8002;
// const pathToKey = path.join(__dirname, '..', '../AUTH_SERVER/keys/id_rsa_pub.pem');
const PUB_KEY = fs.readFileSync("../AUTH_SERVER/keys/id_rsa_pub.pem", 'utf8');

const options = {
    algorithms: ['RS256']
};


// Context object declaration
const contextObject = async ({ req }) => {
    const values = req.headers.authorization.split(' ');
    let verified = null;

    try {
        verified = await verifyJwt(values[1], PUB_KEY, options);
    }
    catch (err) {
        console.log(err);
        throw new AuthenticationError(`INVALID_TOKEN`);
    }

    return {
        permissions: verified.permissions
    };
}

const server = new ApolloServer({
    typeDefs, 
    resolvers,   
    introspection: true,
    playground: true,
    context: contextObject
})

server.listen(PORT).then(async ({ url }) => {
    await connectToDB()
    await syncTables()
    // await syncTables()
    console.log(`Your API is running at: ${url}`);
}).then(async () => {
    await downloadProductsFileAndUploadToRedis();
}).then(async () => { 
    cron.schedule('* */12 * * *', async () => {
        // console.log('test cron');
        // console.log("cron ran: ", new Date().toString());
        await downloadProductsFileAndUploadToRedis()
    },
        // {
        //   scheduled: true,
        //   timezone: "America/Sao_Paulo"
        // }
    );
}).catch((error) => console.log(error.message));

const downloadProductsFileAndUploadToRedis = async () => {
    // console.log("downloadProductsFileAndUploadToRedis is called");
    const downloaded = await downloadFileFromStorage()
    if (downloaded){
        const dataRemoved = await removeAllProductDataInRedis()
        // console.log("Redis data removed: ", dataRemoved);
        const dataAdded = await storeAllProductDataInRedis()
        // console.log("Redis data added: ", dataAdded);
    }
}



// !!!!!!!!!!!!!!!!!!CHECK WHAT TO DO IF YOU DELETE A PRODUCT IN DB!!!!!!!!!!!!!!!!!!!!!





