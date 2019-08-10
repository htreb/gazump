import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { catchError, map, take } from 'rxjs/operators';

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

  constructor(
    private db: AngularFirestore,
    private auth: AuthService,
  ) {}


  /**
   * creates a new group with title and users provided
   * then loops all users and adds the group id to their groups
   * @param title group name
   * @param users GroupUser[]
   */
  createGroup(title: string, users: GroupUser[]) {
    const current: GroupUser = {
      email: this.auth.currentUser.value.email,
      id: this.auth.currentUser.value.id,
      userName: this.auth.currentUser.value.userName,
      isAdmin: true,
    };

    const allUsers = [current, ...users];
    return this.db
      .collection('groups')
      .add({
        title,
        users: allUsers
      })
      .then(res => {
        const promises = [];
        for (const usr of allUsers) {
          const addGroupIdToUser = this.db.collection(`users/${usr.id}/groups`).add({
            id: res.id
          });
          promises.push(addGroupIdToUser);
        }
        return Promise.all(promises).then(() => {
          return res;
        });
      });
  }


  /**
   * gets all group ids a user is in, then calls getOneGroup on all those ids
   */
  getGroups() {
    console.log(`fetching groups...`);
    return this.db
      .collection(`users/${this.auth.currentUser.value.id}/groups`)
      .snapshotChanges()
      .pipe(
        catchError(err => {
          console.log('### getGroups error!', err);
          throw err;
        }),
        map(actions => {
            console.log(`fetched ${actions.length} group(s)`);
            return actions.map((a: any) => {
              const data = a.payload.doc.data();
              const userGroupKey = a.payload.doc.id;
              return this.getOneGroup(data.id, userGroupKey);
            });
          }
        )
      );
  }

  /**
   * returns an observable of the actual group instance.
   * @param id the group id
   * @param userGroupKey the database id where the the group id is stored under the user document
   */
  getOneGroup(id, userGroupKey = null) {
    console.log(`getting one group ${id}...`);
    return this.db
      .doc(`groups/${id}`) // TODO check if the doc exists first?
      .snapshotChanges()
      .pipe(
        catchError(err => {
          console.log('### getOneGroup error!', err);
          throw err;
        }),
        take(1),
        map(changes => {
          console.log(`got one group ${id}`);
          const data = changes.payload.data();
          if (!data) {
            return null;
          }
          const groupId = changes.payload.id;
          return { userGroupKey, id: groupId, ...data };
        })
      );
  }
}
