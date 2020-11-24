import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {Route} from './interfaces';

const httpOptions = {
  headers: new HttpHeaders({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    // 'Content-Type': 'application/x-www-form-urlencoded',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE',
  })
};

@Injectable({
  providedIn: 'root'
})
export class RouteService {

  constructor(private  http: HttpClient) {
  }

  create(route) {
    return this.http.post('http://localhost:8080/api/v1/driver/addDriverRoute', route, httpOptions)
      .pipe(map((res: Route) => {
        return {
          ...route,
          id: res.id,
          routeId: res.routeId,
          date: new Date(route.date)
        };
      }));
  }

  getRoutesByDriverId(driverId) {
    return this.http.get('http://localhost:8080/api/v1/driver/getRoutesByDriverId', driverId)
      .pipe(map(res => {
        return Object.keys(res).map(key => ({
          ...res[key],
          id: key,
          date: new Date()
        }));
      }));
  }

}
