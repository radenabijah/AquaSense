import dotenv from "dotenv";
import mongoose from "mongoose";
import FishSpecies from "./models/FishSpecies.js";
import { pondFishSpecies } from "./data/pondFishSpecies.js";

dotenv.config();

async function seedFishSpecies() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const operations = pondFishSpecies.map((species) => ({
    updateOne: {
      filter: { scientificName: species.scientificName },
      update: { $set: { ...species, enabled: true } },
      upsert: true,
    },
  }));
  const result = await FishSpecies.bulkWrite(operations);
  console.log(
    `Fish species seeded: ${result.upsertedCount} added, ${result.modifiedCount} updated.`,
  );
}

seedFishSpecies()
  .catch((error) => {
    console.error("Failed to seed fish species:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
