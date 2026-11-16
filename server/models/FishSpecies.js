import mongoose from "mongoose";

const fishSpeciesSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    scientificName: { type: String, required: true, trim: true, unique: true },
    pondType: { type: String, required: true, enum: ["Freshwater", "Brackish water"] },
    statusInPhilippines: {
      type: String,
      required: true,
      enum: ["Native", "Farmed; not native"],
    },
    temperatureMin: { type: Number, required: true, min: -50, max: 100 },
    temperatureMax: { type: Number, required: true, min: -50, max: 100 },
    phMin: { type: Number, required: true, min: 0, max: 14 },
    phMax: { type: Number, required: true, min: 0, max: 14 },
    turbidityMax: { type: Number, required: true, min: 0 },
    distribution: { type: String, required: true, trim: true },
    sourceUrl: { type: String, required: true, trim: true },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("FishSpecies", fishSpeciesSchema);
