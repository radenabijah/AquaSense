import assert from "node:assert/strict";
import test from "node:test";
import {
  buildFishRecommendation,
} from "../utils/fishRecommendations.js";
import { pondFishSpecies } from "../data/pondFishSpecies.js";

test("lists curated Philippine-native or Philippine-farmed pond fish", () => {
  assert.deepEqual(
    pondFishSpecies.map((fish) => fish.scientificName),
    [
      "Oreochromis niloticus",
      "Channa striata",
      "Anabas testudineus",
      "Chanos chanos",
      "Lates calcarifer",
      "Clarias gariepinus",
      "Cyprinus carpio",
    ],
  );
  assert.ok(pondFishSpecies.every((fish) => fish.sourceUrl.startsWith("https://")));
  assert.ok(pondFishSpecies.some((fish) => fish.pondType === "Freshwater"));
  assert.ok(pondFishSpecies.some((fish) => fish.pondType === "Brackish water"));
});

test("recommends freshwater fish when current readings fit all screening ranges", () => {
  const species = pondFishSpecies.find((fish) => fish.scientificName === "Channa striata");
  const recommendation = buildFishRecommendation(species, {
    temperature: 28,
    ph: 7.2,
    turbidity: 10,
  });

  assert.equal(recommendation.status, "Recommended");
  assert.equal(recommendation.matchesWaterQuality, true);
  assert.match(recommendation.reason, /fit this species' screening ranges/i);
  assert.equal(recommendation.scientificName, species.scientificName);
});

test("requires salinity confirmation before recommending a brackish species", () => {
  const milkfish = pondFishSpecies.find((fish) => fish.scientificName === "Chanos chanos");
  const recommendation = buildFishRecommendation(milkfish, {
    temperature: 28,
    ph: 8,
    turbidity: 10,
  });

  assert.equal(recommendation.status, "Confirm Salinity");
  assert.equal(recommendation.matchesWaterQuality, true);
  assert.match(recommendation.reason, /does not measure salinity/i);
});

test("waits for a sensor reading before assigning a suitability status", () => {
  const recommendation = buildFishRecommendation(pondFishSpecies[0], null);
  assert.equal(recommendation.status, "Waiting for reading");
  assert.equal(recommendation.matchesWaterQuality, false);
});

test("marks a fish as not recommended when multiple screening values are outside range", () => {
  const recommendation = buildFishRecommendation(pondFishSpecies[1], {
    temperature: 18,
    ph: 5,
    turbidity: 10,
  });

  assert.equal(recommendation.status, "Not Recommended");
  assert.equal(recommendation.matchesWaterQuality, false);
  assert.match(recommendation.reason, /temperature, pH/);
});
