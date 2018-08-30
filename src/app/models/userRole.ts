export interface UserRole {
    id: number;
    name: string;
    maxReservationPeriod: number;
    maxReservationsPerDay: number;
    maxReservationsPerPeriod: number;
    isAdmin: boolean;
    isSuperAdmin: boolean;
    canUseRecurring: boolean;
    FacilityId: number;
}
