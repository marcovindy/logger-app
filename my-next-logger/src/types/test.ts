// types/test.ts
export interface SimulationStatus {
  isSimulating: boolean;
  loadFactor: number;
  progress: number;
}

export interface SimulationAction {
  action: "increase" | "decrease" | "reset";
}
