import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { map, take } from 'rxjs/operators';
import { GroupService } from './group.service';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  constructor(
    private auth: AuthService,
    private groupService: GroupService,
    private db: AngularFirestore
  ) {}

  getUsersContacts() {
    return this.auth.userDoc$.pipe(
      map(userDoc => {
        if (userDoc.loading) {
          return [];
        }
        const users = Object.keys(userDoc.connections).map(id => {
          return {
            id,
            ...userDoc.connections[id]
          };
        });
        return users.sort((a, b) => {
          return a.userName.toLowerCase() < b.userName.toLowerCase() ? -1 : 1;
        });
      })
    );
  }

  getGroupContacts() {
    return this.groupService.currentGroupSubject.pipe(
      map(currentGroup => {
        const allUsers = currentGroup.members.map(
          contactId => this.getDetailsFromId(contactId)
        );

        const filteredUsers = allUsers.filter(
          user => user.id && user.id !== this.auth.userId$.value
        );

        return filteredUsers.sort((a, b) => {
          return a.userName.toLowerCase() < b.userName.toLowerCase() ? -1 : 1;
        });
      })
    );
  }

  getDetailsFromId(id: string) {
    if (
      this.auth.userDoc$.value &&
      this.auth.userDoc$.value.connections &&
      this.auth.userDoc$.value.connections[id]
    ) {
      return { id, ...this.auth.userDoc$.value.connections[id] };
    } else if (id === this.auth.userId$.value) {
      return this.getMyDetails();
    }
    return { userName: 'Unknown', email: 'Unknown' };
  }

  getMyDetails() {
    return {
      id: this.auth.userId$.value,
      userName: 'You',
      email: this.auth.userDoc$.value.email
    };
  }

  getSentRequests() {
    return this.auth.userDoc$.pipe(
      map(userDoc => userDoc.contactRequests || []));
  }

  /**
   * create new contactRequest doc
   * update own user object contactRequests array with
   * invited email and docId of that contactRequest doc
   * @param email address of user they want to invite
   */
  async sendRequest(email) {
    if (email === this.auth.userDoc$.value.email) {
      throw new Error(`You can't add yourself`);
    }
    let requestError;
    // check current sent requests and contacts. Don't duplicate a connection
    await forkJoin({
      sentRequests: this.getSentRequests().pipe(take(1)),
      allContacts: this.getUsersContacts().pipe(take(1)),
    }).subscribe(currentContacts => {
      if (currentContacts.sentRequests.filter(request => request.email === email).length) {
        requestError = 'You have already sent a request to them';
      } else if (currentContacts.allContacts.filter(contact => contact.email === email).length) {
        requestError = 'You are already connected with them';
      }
    });
    if (requestError) {
      throw new Error(requestError);
    } else {
      const newRequestId = this.db.createId();
      const batch = this.db.firestore.batch();
      batch.set(
        this.db.collection('contactRequests').doc(newRequestId).ref,
        {
          accepterEmail: email,
          requester: this.auth.userId$.value,
          requesterUserName: this.auth.userDoc$.value.userName,
          requesterEmail: this.auth.userDoc$.value.email,
          hidden: false,
        });
      batch.update(
        this.db.collection('users')
        .doc(this.auth.userId$.value).ref,
        {
          contactRequests: firebase.firestore.FieldValue.arrayUnion(
          {
              email,
              requestId: newRequestId,
          })
        });

      return batch.commit();
    }
  }

  async cancelSentRequest(request) {
    const batch = this.db.firestore.batch();
    batch.delete(this.db.collection('contactRequests').doc(request.requestId).ref);
    batch.update(this.db.collection('users').doc(this.auth.userId$.value).ref, {
      contactRequests: firebase.firestore.FieldValue.arrayRemove(request),
    });

    return batch.commit();
  }

  getReceivedRequests() {
    return this.db
      .collection('contactRequests', ref => ref
      .where('accepterEmail', '==', this.auth.userDoc$.value.email)
      .where('hidden', '==', false))
      .valueChanges({ idField: 'id' });
  }

  /**
   * By adding the accepter user Id the cloud function will pick up this update
   * and connect the two users.
   * @param receivedRequest the request doc to accept
   */
  acceptContactRequest(receivedRequest) {
    return this.db
      .collection('contactRequests')
      .doc(receivedRequest.id)
      .update({
        accepter: this.auth.userId$.value,
        hidden: true,
      });
  }

  /**
   * By setting hidden to true will hide the request from future contactRequest queries
   * doesn't inform requester they were declined.
   * @param receivedRequest the request doc to decline
   */
  declineContactRequest(receivedRequest) {
    return this.db
    .collection('contactRequests')
    .doc(receivedRequest.id)
    .update({
      hidden: true,
    });
  }
}
