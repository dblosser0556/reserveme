import { CalendarEvent } from 'calendar-utils';
import RRule from 'rrule';

export interface EventActionDetail {
    action: string;
    event: CalendarEvent;
    rrule: string;
}
