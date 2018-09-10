export interface Facility {
    id: number;
    name: string;
    contact: string;
    secondContact?: string;
    phone: string;
    secondPhone?: string;
    address: string;
    address2?: string;
    city: string;
    stateCode: string;
    zipCode: string;
    email: string;
    startHour: number;
    endHour: number;
    maxReservationDays: number;
    createdAt?: Date;
    updateAt?: Date;
}
