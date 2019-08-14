import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';

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
   * gets all groups the logged in user is a member of
   */
  getUsersGroups() {
    return this.db
      .collection('groups', ref =>
        ref.where('members', 'array-contains', this.auth.currentUser.value.id)
      )
      .valueChanges({idField: 'groupId'});
  }
}
