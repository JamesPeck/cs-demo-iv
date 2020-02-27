import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { flatMap } from 'rxjs/operators';

import { environment } from '@env/environment';
import { IdentityService } from '../identity/identity.service';
import { User } from '@app/models';
import { Storage } from '@ionic/storage';
import { AuthMode } from '@ionic-enterprise/identity-vault';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  constructor(private http: HttpClient, private identity: IdentityService, private storage: Storage) {}

  login(email: string, password: string): Observable<boolean> {
    return this.http
      .post<{ success: boolean; user: User; token: string }>(
        `${environment.dataService}/login`,
        {
          username: email,
          password: password
        }
      )
      .pipe(flatMap(r => from(this.unpackResponse(r, password))));
  }

  logout(): Observable<any> {
    return this.http
      .post(`${environment.dataService}/logout`, {})
      .pipe(flatMap(() => from(this.identity.remove())));
  }

  private async unpackResponse(r: any, password?: string): Promise<boolean> {
    const previousUser = await this.storage.get('previousUser');
    const hasSession = await this.identity.hasStoredSession();
    console.log('Previous User: ', previousUser);
    if (!previousUser && !hasSession) {
      if (r.success) {
        this.storage.set('previousUser', r.user.username);
        await this.identity.set(r.user, r.token, password);
        await this.identity.setAuthMode(AuthMode.PasscodeOnly)
      }
    }
    return r.success;
  }
}
