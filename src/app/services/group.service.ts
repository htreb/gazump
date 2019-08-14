import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';

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
      .valueChanges({ idField: 'id' });
  }

  /**
   * creates a new group with title and users provided
   * then loops all users and adds the group id to their groups
   * @param title group name
   * @param users array of userIds
   */
  createGroup(title: string, users: string[]) {
    const allUsers = [this.auth.currentUser.value.id, ...users];
    return this.db.collection('groups').add({
      title,
      members: allUsers
    });
  }
}
