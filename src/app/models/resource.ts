export interface Resource {
    id: number;
    name: string;
    description: string;
    maxReservationTime: number;  // minutes
    minReservationTime: number; // minutes
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
    FacilityId: number;
}
