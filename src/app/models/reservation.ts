export enum resType {
    member,
    league,
    pro,
    other
}
export interface Reservation {
    id: number;
    title: string;
    startDateTime: Date;
    endDateTime: Date;
    type: resType;
    createdAt: Date;
    updatedAt: Date;
    ResourceId: number;
    UserId: number;
}
