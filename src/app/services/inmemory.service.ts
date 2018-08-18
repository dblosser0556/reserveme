import { InMemoryDbService } from 'angular-in-memory-web-api';
import { of } from 'rxjs';

export class InMemoryDataService implements InMemoryDbService {
    createDb() {
        const facilities = [
            { id: 1, facilityName: 'Windstorm', startTime: 360, endTime: 1080 }

        ];

        const resources = [
            { id: 1, name: 'Court 1', description: '', displayOrder: 1, maxReservationTime: 90, minReservationTime: 30 },
            { id: 2, name: 'Court 2', description: '', displayOrder: 2, maxReservationTime: 90, minReservationTime: 30 }
        ];


        const members = [
            {
                id: 1, userId: 'admin', password: 'password', admin: true,
                first: 'admin', last: 'admin', facilityId: 1
            },

            {
                id: 2, userId: 'joesmith', password: 'password', admin: false,
                first: 'joe', last: 'smith', facilityId: 1
            },

        ];


        const reservations = [];

        const db = { facilities, resources, members, reservations };

        return of(db);

    }
}
