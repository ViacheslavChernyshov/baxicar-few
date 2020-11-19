import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {User} from './interfaces';

const httpOptions = {
  headers: new HttpHeaders({
    'Access-Control-Allow-Origin': '*',
    // 'Content-Type': 'application/x-www-form-urlencoded',
    // 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE',
    'Access-Control-Allow-Headers': '*'
  })
};

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {

  constructor(private  http: HttpClient) {
  }

  create(user) {

    return this.http.post('http://localhost:8080/api/v1/user/signup', user, httpOptions)
      .pipe(map((res: User) => {
        return {
          ...user,
          id: res.email,
          date: new Date(user.date)
        };
      }));
  }


}
