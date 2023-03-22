import { MongoClient } from "mongodb";

let client: MongoClient | null = null;

const getDatabaseClient = () => {
  if (!client) {
    console.info("Initialize MongoDB Client");
    client = new MongoClient(process.env.DATABASE_URI!);
  }

  return client;
};

export default getDatabaseClient();
