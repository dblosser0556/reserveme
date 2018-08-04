export interface Resource {
    id: number;
    facilityId: number;
    resourceName: string;
    resourceDesc: string;
    displayOrder: number;
    maxReserveTime: number;  // minutes
    minReserveTime: number; // minutes
}
