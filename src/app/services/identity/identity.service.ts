import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { Storage } from '@ionic/storage';

import { environment } from '../../../environments/environment';
import { User } from '../../models/user';

@Injectable({
  providedIn: 'root'
})
export class IdentityService {
  private tokenKey = 'auth-token';
  private token: string;
  private user: User;
  constructor(private http: HttpClient, private storage: Storage) {}

  get(): Observable<User> {
    if (!this.user) {
      return this.http
        .get<User>(`${environment.dataService}/users/current`)
        .pipe(tap(u => (this.user = u)));
    } else {
      return of(this.user);
    }
  }

  set(user: User): void {
    this.user = user;
  }

  remove(): void {
    this.user = undefined;
  }

  async setToken(token: string) {
    await this.storage.ready();
    if (token) {
      this.storage.set(this.tokenKey, token);
    } else {
      this.storage.remove(this.tokenKey);
    }
  }

  async getToken(): Promise<string> {
    if (!this.token) {
      await this.storage.ready();
      this.token = await this.storage.get(this.tokenKey);
    }
    return this.token;
  }
}
