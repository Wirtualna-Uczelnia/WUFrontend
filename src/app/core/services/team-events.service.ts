import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {UserAuthService} from './user-auth.service';
import {Router} from '@angular/router';
import {catchError} from 'rxjs/operators';
import {ErrorUtils} from './error-utils';
import {of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeamEventsService {
  baseUrl = environment.baseUrl;
  eventModelToSF = {
    title: 'Subject__c',
    description: 'Description__c',
    start: 'Start_Date__c',
    end: 'End_Date__c'
  };

  constructor(private httpClient: HttpClient, private authService: UserAuthService, private router: Router) {
  }

  updateEvent(eventChanges, eventId) {
    const body = {
      event_info: {
        id: eventId
      }
    };
    for (const [key, value] of Object.entries(eventChanges)) {
      if (key === 'end' || key === 'start') {
        // @ts-ignore
        body.event_info[this.eventModelToSF[key]] = value.toISOString();
      } else {
        body.event_info[this.eventModelToSF[key]] = value;
      }
    }
    // @ts-ignore
    return this.httpClient.post<any>(this.baseUrl + 'collab/editEvent/', body, {responseType: 'text', withCredentials: true}).pipe(
      catchError((error) => {
        ErrorUtils.isSessionExpired(error, this.authService, this.router);
        return of('error');
      })
    );
  }

  createEvent(eventData, teamId){
    const body = {
      event_info: {
        Team__c: teamId,
        Subject__c: eventData.title,
        Description__c: eventData.description,
        Start_Date__c: eventData.start.toISOString(),
        End_Date__c: eventData.end.toISOString()
      }
    };
    return this.httpClient.post<any>(this.baseUrl + 'collab/createEvent/', body, {withCredentials: true}).pipe(
      catchError((error) => {
        ErrorUtils.isSessionExpired(error, this.authService, this.router);
        return of('error');
      })
    );
  }
}