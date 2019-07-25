import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { take, map, switchMap } from 'rxjs/operators';
import * as firebase from 'firebase/app';
import { forkJoin, from } from 'rxjs';
import { AngularFireStorage, AngularFireStorageReference } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(
    private db: AngularFirestore,
    private auth: AuthService,
    private storage: AngularFireStorage) {}

  /**
   * Takes a string input and searches through the users emails and nicknames for a match.
   * returns a forkJoined observable: email, nickname
   * @param value string to search for
   */
  findUserByEmailOrNickName(value: string) {
    value = value.toLowerCase();
    const email = this.db.collection('users', ref => ref.where('email', '==', value)).snapshotChanges().pipe(
      take(1),
      map(actions => actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
    const nickname = this.db.collection('users', ref => ref.where('nickname', '==', value)).snapshotChanges().pipe(
      take(1),
      map(actions => actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
    return forkJoin([email, nickname]);
  }

  /**
   * creates a new chat group
   * @param title group name
   * @param users string[]
   */
  createGroup(title: string, users: string[]) {
    const current = {
      email: this.auth.currentUser.value.email,
      id: this.auth.currentUser.value.id,
      nickname: this.auth.currentUser.value.nickname
    };

    const allUsers = [current, ...users];
    return this.db.collection('groups').add({
      title,
      users: allUsers
    }).then(res => {
      const promises = [];

      for (const usr of allUsers) {
        const oneAdd = this.db.collection(`users/${usr.id}/groups`).add({
          id: res.id
        });
        promises.push(oneAdd);
      }
      return Promise.all(promises);
    });
  }

  getGroups() {
    return this.db.collection(`users/${this.auth.currentUser.value.id}/groups`).snapshotChanges().pipe(
      map(actions => actions.map((a: any) => {
        const data = a.payload.doc.data();
        const userGroupKey = a.payload.doc.id;
        return this.getOneGroup(data.id, userGroupKey);
      }))
    );
  }

  getOneGroup(id, userGroupKey = null) {
    return this.db.doc(`groups/${id}`).snapshotChanges().pipe(
      take(1),
      map(changes => {
        const data = changes.payload.data();
        const groupId = changes.payload.id;
        return { userGroupKey, id: groupId, ...data };
      })
    );
  }

  getChatMessages(groupId) {
    return this.db.collection(`groups/${groupId}/messages`, ref => ref.orderBy('createdAt')).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  addChatMessage(msg, chatId) {
    return this.db.collection('groups/' + chatId + '/messages').add({
      msg,
      from: this.auth.currentUser.value.id,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }

  addFileMessage(file, chatId) {
    const newName = `${new Date().getTime()}-${this.auth.currentUser.value.id}.png`;
    const storageRef: AngularFireStorageReference = this.storage.ref(`/files/${chatId}/${newName}`);
    return {task: storageRef.putString(file, 'base64', { contentType: 'image/png'}), ref: storageRef };
  }

  saveFileMessage(filePath, chatId) {
    return this.db.collection('groups/' + chatId + '/messages').add({
      file: filePath,
      from: this.auth.currentUser.value.id,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }

  leaveGroup(groupId, users) {
    return this.getGroups().pipe(
      switchMap(userGroups => {
        return forkJoin(userGroups);
      }),
      map((data: any) => {
        let toDelete = null;

        for (const group of data) {
          if (group.id === groupId) {
            toDelete = group.userGroupKey;
          }
        }
        return toDelete;
      }),
      switchMap(deleteId => {
        return from(this.db.doc(`users/${this.auth.currentUser.value.id}/groups/${deleteId}`).delete());
      }),
      switchMap(() => {
        return from(this.db.doc(`groups/${groupId}`).update({
          users
        }));
      })
    );
  }
}
