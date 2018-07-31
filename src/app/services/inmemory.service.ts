import { InMemoryDbService } from 'angular-in-memory-web-api';
import { of } from 'rxjs';

export class InMemoryDataService implements InMemoryDbService {
    createDb() {
        const facilities = [
            { id: 1, facilityName: 'Windstorm', startTime: 360, endTime: 1080 }

        ];

        const resources = [
            { id: 1, resourceName: 'Court 1', resourceDesc: '', displayOrder: 1, maxReserveTime: 90, minReserveTime: 30 },
            { id: 2, resourceName: 'Court 2', resourceDesc: '', displayOrder: 2, maxReserveTime: 90, minReserveTime: 30 }
        ];


        const members = [
            {
                id: 1, userId: 'admin', password: 'password', admin: true,
                firstName: 'admin', lastName: 'admin', facilityId: 1
            },

            {
                id: 2, userId: 'joesmith', password: 'password', admin: false,
                firstName: 'joe', lastName: 'smith', facilityId: 1
            },

        ];


        const reservations = [];

        const db = { facilities, resources, members, reservations };

        return of(db);

    }
}
