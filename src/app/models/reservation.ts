export enum resType {
    member,
    league,
    pro,
    other
}
export interface Reservation {
    id: number;
    title: string;
    start: Date;
    end: Date;
    type: resType;
    createdAt?: Date;
    updatedAt?: Date;
    rrule?: string;
    rruleStart?: Date;
    rruleEnd?: Date;
    ResourceId: number;
    UserId: number;
}
