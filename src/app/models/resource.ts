export interface Resource {
    id: number;
    resourceName: string;
    resourceDesc: string;
    displayOrder: number;
    maxReserveTime: number;  // minutes
    minReserveTime: number; // minutes
}
