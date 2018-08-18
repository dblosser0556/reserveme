export interface UserRole {
    id: number;
    name: string;
    maxReservationPeriod: number;
    maxReserervationsPerDay: number;
    maxReservationsPerPeriod: number;
    isAdmin: boolean;

    FacilityId: number;
}
