/**
 * Initiates a single-node replica set on a local mongod.
 *
 * The app writes an application and its first status event together, which
 * MongoDB only allows on a replica set. Atlas is one already — this is only for
 * local development.
 *
 *   node scripts/init-replica-set.mjs [uri]
 *
 * Defaults to mongodb://127.0.0.1:27018. The mongod must already be running
 * with --replSet rs0.
 */
import { MongoClient } from "mongodb";

const uri = process.argv[2] ?? "mongodb://127.0.0.1:27018/?directConnection=true";
const host = new URL(uri.replace("mongodb://", "http://")).host;

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
await client.connect();
const admin = client.db("admin");

try {
  const status = await admin.command({ replSetGetStatus: 1 });
  console.log(`Replica set already initiated (state ${status.myState}).`);
} catch (error) {
  // 94 / NotYetInitialized simply means this is a fresh data directory.
  if (error.codeName === "NotYetInitialized" || error.code === 94) {
    await admin.command({
      replSetInitiate: { _id: "rs0", members: [{ _id: 0, host }] },
    });
    console.log(`Sent replSetInitiate for rs0 on ${host}.`);
  } else {
    await client.close();
    throw error;
  }
}

// Wait for PRIMARY before anything tries to write.
let ready = false;
for (let i = 0; i < 60; i++) {
  const status = await admin.command({ replSetGetStatus: 1 });
  if (status.myState === 1) {
    ready = true;
    break;
  }
  await new Promise((resolve) => setTimeout(resolve, 500));
}

console.log(ready ? "PRIMARY ready." : "Timed out waiting for PRIMARY.");
await client.close();
process.exit(ready ? 0 : 1);
