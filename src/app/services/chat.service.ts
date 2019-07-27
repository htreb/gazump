import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { take, map, switchMap } from 'rxjs/operators';
import * as firebase from 'firebase/app';
import { forkJoin, from } from 'rxjs';
import {
  AngularFireStorage,
  AngularFireStorageReference
} from '@angular/fire/storage';

export interface ChatUser {
  email: string;
  id: string;
  nickname: string;
}
@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(
    private db: AngularFirestore,
    private auth: AuthService,
    private storage: AngularFireStorage
  ) {}

  /**
   * Takes a string input and searches through the users emails and nicknames for a match.
   * returns a forkJoined observable: email, nickname
   * @param value string to search for
   */
  findUserByEmailOrNickName(value: string) {
    value = value.toLowerCase();
    const email = this.db
      .collection('users', ref => ref.where('email', '==', value))
      .snapshotChanges()
      .pipe(
        take(1),
        map(actions =>
          actions.map(a => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        )
      );
    const nickname = this.db
      .collection('users', ref => ref.where('nickname', '==', value))
      .snapshotChanges()
      .pipe(
        take(1),
        map(actions =>
          actions.map(a => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        )
      );
    return forkJoin([email, nickname]);
  }

  /**
   * creates a new chat with title and users provided
   * then loops all users and adds the chat id to their chats
   * @param title chat name
   * @param users string[]
   */
  createChat(title: string, users: ChatUser[]) {
    const current = {
      email: this.auth.currentUser.value.email,
      id: this.auth.currentUser.value.id,
      nickname: this.auth.currentUser.value.nickname,
      isAdmin: true
    };

    const allUsers = [current, ...users];
    return this.db
      .collection('chats')
      .add({
        title,
        users: allUsers
      })
      .then(res => {
        const promises = [];
        for (const usr of allUsers) {
          const oneAdd = this.db.collection(`users/${usr.id}/chats`).add({
            id: res.id
          });
          promises.push(oneAdd);
        }
        return Promise.all(promises).then(() => {
          return res;
        });
      });
  }

  /**
   * gets all chat ids a user is in, then calls getOneChat on all those ids
   */
  getChats() {
    return this.db
      .collection(`users/${this.auth.currentUser.value.id}/chats`)
      .snapshotChanges()
      .pipe(
        map(actions =>
          actions.map((a: any) => {
            const data = a.payload.doc.data();
            const userChatKey = a.payload.doc.id;
            return this.getOneChat(data.id, userChatKey);
          })
        )
      );
  }

  /**
   * returns an observable of the actual chat instance.
   * @param id the chat id
   * @param userChatKey the database id where the the chat id is stored under the user document
   */
  getOneChat(id, userChatKey = null) {
    return this.db
      .doc(`chats/${id}`) // TODO check if the doc exists first?
      .snapshotChanges()
      .pipe(
        take(1),
        map(changes => {
          const data = changes.payload.data();
          if (!data) {
            return null;
          }
          const chatId = changes.payload.id;
          return { userChatKey, id: chatId, ...data };
        })
      );
  }

  getChatMessages(chatId) {
    return this.db
      .collection(`chats/${chatId}/messages`, ref => ref.orderBy('createdAt'))
      .snapshotChanges()
      .pipe(
        map(actions =>
          actions.map(a => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        )
      );
  }

  addChatMessage(msg, chatId) {
    return this.db.collection('chats/' + chatId + '/messages').add({
      msg,
      from: this.auth.currentUser.value.id,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }

  saveFileToStorage(file, chatId) {
    const newName = `${new Date().getTime()}-${
      this.auth.currentUser.value.id
    }.png`;
    const storageRef: AngularFireStorageReference = this.storage.ref(
      `/files/${chatId}/${newName}`
    );
    return {
      task: storageRef.putString(file, 'base64', { contentType: 'image/png' }),
      ref: storageRef
    };
  }

  saveFileMessage(filePath, chatId) {
    return this.db.collection('chats/' + chatId + '/messages').add({
      file: filePath,
      from: this.auth.currentUser.value.id,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }

  leaveChat(chatId, users) {
    return this.getChats().pipe(
      switchMap(userChats => {
        return forkJoin(userChats);
      }),
      map((data: any) => {
        let toDelete = null;

        for (const chat of data) {
          if (chat.id === chatId) {
            toDelete = chat.userChatKey;
          }
        }
        return toDelete;
      }),
      switchMap(deleteId => {
        return from(
          this.db
            .doc(`users/${this.auth.currentUser.value.id}/chats/${deleteId}`)
            .delete()
        );
      }),
      switchMap(() => {
        return from(
          this.db.doc(`chats/${chatId}`).update({
            users
          })
        );
      })
    );
  }
}
