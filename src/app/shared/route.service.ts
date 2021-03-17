import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map, tap} from 'rxjs/operators';
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

  route: Route;

  constructor(private  http: HttpClient) {
  }


  create(route) {
    // return this.http.post('http://localhost:8080/api/v1/driver/addDriverRoute', route, httpOptions);
    return this.http.post('http://localhost:8080/api/v1/driver/addDriverRoute', route, { responseType: 'text' });
  }

  // create(route) {
  //   return this.http.post('http://localhost:8080/api/v1/driver/addDriverRoute', route, httpOptions)
  //     .pipe(map((res: Route) => {
  //       return {
  //         ...route,
  //         id: res.id,
  //         routeId: res.routeId,
  //         date: new Date(route.date)
  //       };
  //     }));
  // }

  getRoutesByDriverId(id) {
    return this.http.get(`http://localhost:8080/api/v1/driver/routes/${id}`);
    // return this.http.get('http://localhost:8080/api/v1/driver/routes/' + id);
    // return this.http.get('http://localhost:8080/api/v1/driver/routes/' + id)
    //   .pipe(map(res => {
    //     return Object.keys(res).map(key => ({
    //       ...res[key],
    //       id: key,
    //       date: new Date()
    //     }));
    //   }));


    // return this.http.get(`http://localhost:8080/api/v1/driver/routes/${id}`).pipe(map(res => {
    //   return Object.keys(res).map(key => ({
    //     ...res[key],
    //     id: key,
    //     routeId: res[key].routeId,
    //     date: new Date()
    //   }));
    // }));
  }
}
