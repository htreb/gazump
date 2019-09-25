import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';
import { GroupService } from './group.service';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  constructor(
    private auth: AuthService,
    private groupService: GroupService,
    ) {}

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
        const users = Object.keys(userDoc.connections).map(id => {
          return {
            id,
            ...userDoc.connections[id]
          };
        });
        return users.sort((a, b) => {
          return a.userName < b.userName ? -1 : 1;
        });
      })
    );
  }

  getGroupContacts() {
    return this.groupService.currentGroupSubject.pipe(
      map(currentGroup => {
        const withoutMe = Object.keys(currentGroup.members).filter(id => id !== this.auth.currentUser.value.id);
        const users = withoutMe.map(id => {
          if (id !== this.auth.currentUser.value.id) {
            return this.getDetailsFromId(id);
          }
        });
        return users.sort((a, b) => {
          return a.userName < b.userName ? -1 : 1;
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
