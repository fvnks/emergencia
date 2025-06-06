
'use server';
/**
 * @fileOverview A Genkit flow for simulating vehicle tracking updates.
 *
 * - getVehicleUpdates - Simulates fetching real-time vehicle data.
 * - VehicleTrackingInput - The input type (empty for this simulation).
 * - VehicleTrackingOutput - The return type (list of simulated vehicles).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Consistent with frontend types
type VehicleType = 'Bomba' | 'Escala' | 'Rescate' | 'Ambulancia' | 'HazMat' | 'Forestal' | 'Utilitario' | 'Transporte Personal' | 'Otro';
type VehicleStatus = "En Base" | "En Ruta" | "En Emergencia" | "Necesita Mantención" | "Fuera de Servicio";

const SimulatedVehicleSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['Bomba', 'Escala', 'Rescate', 'Ambulancia', 'HazMat', 'Forestal', 'Utilitario', 'Transporte Personal', 'Otro']),
  status: z.enum(["En Base", "En Ruta", "En Emergencia", "Necesita Mantención", "Fuera de Servicio"]),
  lastUpdate: z.string(),
  location: z.object({ lat: z.number(), lon: z.number() }),
  assignedIncident: z.string().nullable().optional(),
});
export type SimulatedVehicle = z.infer<typeof SimulatedVehicleSchema>;

const VehicleTrackingInputSchema = z.object({});
export type VehicleTrackingInput = z.infer<typeof VehicleTrackingInputSchema>;

const VehicleTrackingOutputSchema = z.object({
  vehicles: z.array(SimulatedVehicleSchema),
});
export type VehicleTrackingOutput = z.infer<typeof VehicleTrackingOutputSchema>;


const initialVehiclesData: SimulatedVehicle[] = [
  { id: "v1", name: "B-01", type: "Bomba", status: "En Base", lastUpdate: "00:00:00", location: { lat: -33.450, lon: -70.660 }, assignedIncident: null },
  { id: "v2", name: "M-02", type: "Ambulancia", status: "En Ruta", lastUpdate: "00:00:00", location: { lat: -33.455, lon: -70.665 }, assignedIncident: "Accidente en Ruta 5" },
  { id: "v3", name: "R-03", type: "Rescate", status: "En Emergencia", lastUpdate: "00:00:00", location: { lat: -33.460, lon: -70.670 }, assignedIncident: "Derrumbe sector El Salto" },
  { id: "v4", name: "UT-04", type: "Utilitario", status: "Necesita Mantención", lastUpdate: "00:00:00", location: { lat: -33.465, lon: -70.675 }, assignedIncident: null },
  { id: "v5", name: "Q-05", type: "HazMat", status: "Fuera de Servicio", lastUpdate: "00:00:00", location: { lat: -33.470, lon: -70.680 }, assignedIncident: null },
  { id: "v6", name: "B-02", type: "Bomba", status: "En Ruta", lastUpdate: "00:00:00", location: { lat: -33.475, lon: -70.685 }, assignedIncident: null },
  { id: "v7", name: "F-01", type: "Forestal", status: "En Base", lastUpdate: "00:00:00", location: { lat: -33.480, lon: -70.690 }, assignedIncident: null },
];

// WARNING: This in-memory state is for DEV SIMULATION ONLY. 
// It will reset on server restart or when the module is reloaded.
// A real backend would use a database or a persistent cache.
let currentSimulatedVehicles = JSON.parse(JSON.stringify(initialVehiclesData)) as SimulatedVehicle[];

function getRandomStatusFlow(currentStatus: VehicleStatus): VehicleStatus {
  if (currentStatus === "Fuera de Servicio") return "Fuera de Servicio";
  const statuses: VehicleStatus[] = ["En Base", "En Ruta", "En Emergencia"];
  return statuses[Math.floor(Math.random() * statuses.length)];
}

function getRandomIncidentFlow(): string | null {
    const incidents = ["Incendio en Casona Vieja", "Accidente Múltiple Autopista Central", "Rescate Persona Atrapada", null, "Derrame Químico Industrial", null];
    return incidents[Math.floor(Math.random() * incidents.length)];
}

export async function getVehicleUpdates(input: VehicleTrackingInput): Promise<VehicleTrackingOutput> {
  return getVehicleUpdatesFlow(input);
}

const getVehicleUpdatesFlow = ai.defineFlow(
  {
    name: 'getVehicleUpdatesFlow',
    inputSchema: VehicleTrackingInputSchema,
    outputSchema: VehicleTrackingOutputSchema,
  },
  async (input) => {
    // Simulate updates
    currentSimulatedVehicles = currentSimulatedVehicles.map((v) => {
      const newStatus = v.status === "Fuera de Servicio" || v.status === "Necesita Mantención" ? v.status : getRandomStatusFlow(v.status);
      const newLocation = {
        lat: v.location.lat + (Math.random() - 0.5) * 0.002,
        lon: v.location.lon + (Math.random() - 0.5) * 0.002,
      };
      return {
        ...v,
        status: newStatus,
        lastUpdate: new Date().toLocaleTimeString('es-CL'),
        location: newLocation,
        assignedIncident: newStatus === "En Emergencia" ? (v.assignedIncident || getRandomIncidentFlow() || "Emergencia Activa") : null,
      };
    });

    return { vehicles: [...currentSimulatedVehicles] }; // Return a copy
  }
);
