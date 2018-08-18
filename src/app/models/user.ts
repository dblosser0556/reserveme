import { UserRole } from './userRole';
import { Reservation } from './reservation';
import { Facility } from './facility';

export interface User {
    id: number;

    password: string;
    first: string;
    last: string;
    email: string;
    phone: string;
    FacilityId: number;
    UserRoleId: number;
    userRole?: UserRole;
    facility?: Facility;
    reservations?: Reservation[];
}
