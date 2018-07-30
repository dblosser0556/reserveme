export interface Reservation {
    id: number;
    startDateTime: Date;
    endDateTime: Date;

    resourceId: number;
    memberId: number;
}
