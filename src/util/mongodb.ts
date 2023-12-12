import { MongoClient } from 'mongodb';
import { mongodbConfig } from '../config/mongodb.config';

const client = new MongoClient(mongodbConfig.uri);
const db = client.db(mongodbConfig.dbName);

export default db;
