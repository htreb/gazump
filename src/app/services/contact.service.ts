import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';
import { GroupService } from './group.service';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  constructor(
    private auth: AuthService,
    private groupService: GroupService,
    private db: AngularFirestore
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
        // TODO I'm filtering myself twice here - also shouln't return 'unknown' not useful
        const withoutMe = Object.keys(currentGroup.members).filter(
          id => id !== this.auth.currentUser.value.id
        );
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
      return { id, ...this.auth.currentUser.value.connections[id] };
    } else if (id === this.auth.currentUser.value.id) {
      return {
        id,
        userName: 'You',
        email: this.auth.currentUser.value.email
      };
    }
    return { userName: 'Unknown', email: 'Unknown' };
  }

  getSentRequests() {
    return this.db
      .collection('users')
      .doc(this.auth.currentUser.value.id)
      .collection('sentContactRequests')
      .valueChanges({ idField: 'id' });
  }

  sendRequest(email) {
    // TODO Cloud function will pick up a change here and submit request to user if they exist
    this.db
      .collection('users')
      .doc(this.auth.currentUser.value.id)
      .collection('sentContactRequests')
      .add({email});
  }

  cancelSentRequest(requestId) {
    // TODO Cloud function will pick up a change here and remove request from user if they exist
    this.db
      .collection('users')
      .doc(this.auth.currentUser.value.id)
      .collection('sentContactRequests')
      .doc(requestId)
      .delete();
  }

  getReceivedRequests() {
    return this.auth.currentUser.pipe(map(userDoc => userDoc.receivedContactRequests));
  }

  acceptContactRequest(user) {
    // TODO some cloud function needed here?
    console.log('accept request from', user);
  }

  declineContactRequest(user) {
    // I can do this silently, no need to tell the other user they were declined
    this.db
    .collection('users')
    .doc(this.auth.currentUser.value.id)
    .update({
      receivedContactRequests: firebase.firestore.FieldValue.arrayRemove(user)
    });
  }
}


// const batch = this.db.firestore.batch();
// batch.update(
//   this.db.firestore.collection('users').doc(this.auth.currentUser.value.id),
//   {
//     pendingRequests: firebase.firestore.FieldValue.arrayUnion(email)
//   }
// );
// // batch.update()

// this.db
//   .collection('users', ref => ref.where('email', '==', email).limit(1))
//   .valueChanges()
//   .pipe(
//     take(1),
//     map(user => {
//       return user;
//     })
//   );
