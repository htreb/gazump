import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { catchError, map, take } from 'rxjs/operators';
import { group } from '@angular/animations';

export interface GroupUser {
  email: string;
  id: string;
  userName: string;
  isAdmin?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  constructor(private db: AngularFirestore, private auth: AuthService) {}

  /**
   * gets all groups a user is in
   */
  getUsersGroups() {
    return this.db
      .collection('groups', ref =>
        ref.where('members', 'array-contains', this.auth.currentUser.value.id)
      )
      .valueChanges();
  }
}
