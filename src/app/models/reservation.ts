export enum resType {
    member,
    league,
    pro,
    other
}
export interface Reservation {
    id: number;
    startDateTime: Date;
    endDateTime: Date;
    title: string;
    type: resType;
    resourceId: number;
    memberId: number;
}
