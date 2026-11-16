export function buildFishRecommendation(fish, water) {
  const species = {
    ...fish,
    temperature: [fish.temperatureMin, fish.temperatureMax],
    ph: [fish.phMin, fish.phMax],
    turbidity: fish.turbidityMax,
  };

  if (!water) {
    return {
      ...species,
      matchesWaterQuality: false,
      status: "Waiting for reading",
      reason: "A current sensor reading is required before comparing water conditions.",
    };
  }

  const outOfRange = [];
  if (water.temperature < species.temperature[0] || water.temperature > species.temperature[1]) {
    outOfRange.push("temperature");
  }
  if (water.ph < species.ph[0] || water.ph > species.ph[1]) {
    outOfRange.push("pH");
  }
  if (water.turbidity > species.turbidity) {
    outOfRange.push("turbidity");
  }

  if (outOfRange.length > 0) {
    return {
      ...species,
      matchesWaterQuality: false,
      status: outOfRange.length === 1 ? "Needs Adjustment" : "Not Recommended",
      reason: `Current water is outside the screening range for ${outOfRange.join(", ")}.`,
    };
  }

  if (species.pondType === "Brackish water") {
    return {
      ...species,
      matchesWaterQuality: true,
      status: "Confirm Salinity",
      reason:
        "Current temperature, pH, and turbidity fit the screening ranges. Confirm the pond is brackish; AquaSense does not measure salinity.",
    };
  }

  return {
    ...species,
    matchesWaterQuality: true,
    status: "Recommended",
    reason:
      "Current freshwater temperature, pH, and turbidity fit this species' screening ranges. Confirm pond and stocking conditions before use.",
  };
}
