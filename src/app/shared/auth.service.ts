import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {tap} from 'rxjs/operators';
import {environment} from 'src/environments/environment';

const httpOptions = {
  headers: new HttpHeaders({

    'Access-Control-Allow-Origin': '*',
    // 'Access-Control-Allow-Headers': '*'
  })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {
  }

  login(User) {
    return this.http.post('http://localhost:8080/api/v1/auth/login', User, httpOptions).pipe(
      tap(this.setToken)
    );
  }

  private setToken(response) {
    if (response) {
      const expData = new Date(new Date().getTime() + response.expiresIn * 1000);
      localStorage.setItem('fb-token-exp', expData.toString());
      localStorage.setItem('fb-token', response.token);
    } else {
      localStorage.clear();
    }
  }

  get token() {
    const expDate = new Date(localStorage.getItem('fb-token-exp'));
    if (new Date > expDate) {
      this.logout();
      return null;
    }
    return localStorage.getItem('fb-token');
  }

  logout() {
    this.setToken(null);
  }

  isAuthenticated() {
    return !!this.token;
  }
}
