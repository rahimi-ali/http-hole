interface MongodbConfigInterface {
    uri: string;
    dbName: string;
}

const mongodbConfig: MongodbConfigInterface = {
    uri: process.env.MONGODB_URI ,
    dbName: process.env.MONGODB_DB_NAME ,
}

export { mongodbConfig };