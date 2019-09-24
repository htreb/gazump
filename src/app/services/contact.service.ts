import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  constructor(private auth: AuthService) {}

  getMe() {
    return {
      id: this.auth.currentUser.value.id,
      userName: this.auth.currentUser.value.userName,
      email: this.auth.currentUser.value.email
    };
  }

  getUsersContacts() {
    return this.auth.currentUser.pipe(
      map(userDoc => {
        return Object.keys(userDoc.connections).map(id => {
          return {
            id,
            ...userDoc.connections[id]
          };
        });
      })
    );
  }

  getDetailsFromId(id: string) {
    if (
      this.auth.currentUser.value &&
      this.auth.currentUser.value.connections &&
      this.auth.currentUser.value.connections[id]
    ) {
      return this.auth.currentUser.value.connections[id];
    } else if (id === this.auth.currentUser.value.id) {
      return {
        userName: 'You',
        email: this.auth.currentUser.value.email,
      };
    }
    return { userName: 'Unknown', email: 'Unknown' };
  }
}
