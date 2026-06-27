import type { SpeedUnit, UserPreferences, WeightUnit } from "./types";

const LB_PER_KG = 2.2046226218;
const KM_PER_MILE = 1.609344;

export function kgToLb(kg: number): number {
  return kg * LB_PER_KG;
}

export function lbToKg(lb: number): number {
  return lb / LB_PER_KG;
}

export function kmhToMph(kmh: number): number {
  return kmh / KM_PER_MILE;
}

export function mphToKmh(mph: number): number {
  return mph * KM_PER_MILE;
}

export function kmToMiles(km: number): number {
  return km / KM_PER_MILE;
}

export function milesToKm(miles: number): number {
  return miles * KM_PER_MILE;
}

export function displayWeight(kg: number, unit: WeightUnit): number {
  if (kg <= 0) return 0;
  return unit === "lb" ? Math.round(kgToLb(kg) * 10) / 10 : Math.round(kg * 10) / 10;
}

export function inputWeightToKg(value: number, unit: WeightUnit): number {
  if (value <= 0) return 0;
  return unit === "lb" ? lbToKg(value) : value;
}

export function displaySpeed(kmh: number, unit: SpeedUnit): number {
  if (kmh <= 0) return 0;
  return unit === "mph"
    ? Math.round(kmhToMph(kmh) * 10) / 10
    : Math.round(kmh * 10) / 10;
}

export function inputSpeedToKmh(value: number, unit: SpeedUnit): number {
  if (value <= 0) return 0;
  return unit === "mph" ? mphToKmh(value) : value;
}

export function displayDistance(km: number, unit: SpeedUnit): number {
  if (km <= 0) return 0;
  return unit === "mph"
    ? Math.round(kmToMiles(km) * 100) / 100
    : Math.round(km * 100) / 100;
}

export function inputDistanceToKm(value: number, unit: SpeedUnit): number {
  if (value <= 0) return 0;
  return unit === "mph" ? milesToKm(value) : value;
}

export function weightLabel(unit: WeightUnit): string {
  return unit === "lb" ? "Weight (lb)" : "Weight (kg)";
}

export function assistLabel(unit: WeightUnit): string {
  return unit === "lb" ? "Assist (lb)" : "Assist (kg)";
}

export function speedLabel(unit: SpeedUnit): string {
  return unit === "mph" ? "Speed (mph)" : "Speed (km/h)";
}

export function distanceLabel(unit: SpeedUnit): string {
  return unit === "mph" ? "Distance (mi)" : "Distance (km)";
}

export function weightUnitSymbol(unit: WeightUnit): string {
  return unit === "lb" ? "lb" : "kg";
}

export function speedUnitSymbol(unit: SpeedUnit): string {
  return unit === "mph" ? "mph" : "km/h";
}

export function distanceUnitSymbol(unit: SpeedUnit): string {
  return unit === "mph" ? "mi" : "km";
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  weightUnit: "kg",
  speedUnit: "kmh",
};
