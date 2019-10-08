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
        if (!currentGroup.members) {
          return [];
        }
        const allUsers = currentGroup.members.map(
          contactId => this.getDetailsFromId(contactId)
        );

        const filteredUsers = allUsers.filter(
          user => user.id && user.id !== this.auth.currentUser.value.id
        );

        return filteredUsers.sort((a, b) => {
          return a.userName < b.userName ? -1 : 1;
        });
      })
    );
  }

  getDetailsFromId(id: string, getMe = false) {
    if (
      this.auth.currentUser.value &&
      this.auth.currentUser.value.connections &&
      this.auth.currentUser.value.connections[id]
    ) {
      return { id, ...this.auth.currentUser.value.connections[id] };
    } else if (id === this.auth.currentUser.value.id || getMe) {
      return {
        id: this.auth.currentUser.value.id,
        userName: 'You',
        email: this.auth.currentUser.value.email
      };
    }
    return { userName: 'Unknown', email: 'Unknown' };
  }

  getSentRequests() {
    return this.auth.currentUser.pipe(
      map(userDoc => userDoc.contactRequests || []));
  }

  /**
   * create new contactRequest doc
   * update own user object contactRequests array with
   * invited email and docId of that contactRequest doc
   * @param email address of user they want to invite
   */
  async sendRequest(email) {
    // TODO Cloud function will pick up a change here and submit request to user if they exist
    if (email === this.auth.currentUser.value.email) {
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
      const request = await this.db
        .collection('contactRequests')
        .add({
          accepterEmail: email,
          requester: this.auth.currentUser.value.id,
          requesterUserName: this.auth.currentUser.value.userName,
          requesterEmail: this.auth.currentUser.value.email,
          declined: false,
        });

      this.db.collection('users')
        .doc(this.auth.currentUser.value.id)
        .update({
          contactRequests: firebase.firestore.FieldValue.arrayUnion({
            email,
            requestId: request.id,
          })
        });
    }
  }

  async cancelSentRequest(request) {
    // TODO Cloud function will pick up a change here and remove request from user if they exist
    const batch = this.db.firestore.batch();

    batch.delete(this.db.collection('contactRequests').doc(request.requestId).ref);
    batch.update(this.db.collection('users').doc(this.auth.currentUser.value.id).ref, {
      contactRequests: firebase.firestore.FieldValue.arrayRemove(request),
    });

    batch.commit();
  }

  getReceivedRequests() {
    return this.db
      .collection('contactRequests', ref => ref
      .where('accepterEmail', '==', this.auth.currentUser.value.email)
      .where('declined', '==', false))
      .valueChanges({ idField: 'id' });
  }

  /**
   * By adding the accepter user Id the cloud function will pick up this update
   * and connect the two users.
   * @param receivedRequest the request doc to accept
   */
  acceptContactRequest(receivedRequest) {
    // TODO some cloud function needed here?
    return this.db
      .collection('contactRequests')
      .doc(receivedRequest.id)
      .update({
        accepter: this.auth.currentUser.value.id,
      });
  }

  /**
   * By setting declined to true will hide the request from future contactRequest queries
   * doesn't inform requester they were declined.
   * @param receivedRequest the request doc to decline
   */
  declineContactRequest(receivedRequest) {
    // I can do this silently, no need to tell the other user they were declined
    return this.db
    .collection('contactRequests')
    .doc(receivedRequest.id)
    .update({
      declined: true,
    });
  }
}
