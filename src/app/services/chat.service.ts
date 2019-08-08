import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { take, map, switchMap, catchError } from 'rxjs/operators';
import * as firebase from 'firebase/app';
import { forkJoin, from } from 'rxjs';
import {
  AngularFireStorage,
  AngularFireStorageReference
} from '@angular/fire/storage';

export interface ChatUser {
  email: string;
  id: string;
  userName: string;
  isAdmin?: boolean;
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
   * Takes a string input and searches through the users emails and userNames for a match.
   * returns a forkJoined observable: email, userName
   * @param value string to search for
   */
  findUserByEmailOrUserName(value: string) {
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
    const userName = this.db
      .collection('users', ref => ref.where('userName', '==', value))
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
    return forkJoin([email, userName]);
  }

  /**
   * creates a new chat with title and users provided
   * then loops all users and adds the chat id to their chats
   * @param title chat name
   * @param users ChatUser[]
   */
  createChat(title: string, users: ChatUser[]) {
    const current: ChatUser = {
      email: this.auth.currentUser.value.email,
      id: this.auth.currentUser.value.id,
      userName: this.auth.currentUser.value.userName,
      isAdmin: true,
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
          const addChatIdToUser = this.db.collection(`users/${usr.id}/chats`).add({
            id: res.id
          });
          promises.push(addChatIdToUser);
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
    console.log(`fetching chats...`);
    return this.db
      .collection(`users/${this.auth.currentUser.value.id}/chats`)
      .snapshotChanges()
      .pipe(
        catchError(err => {
          console.log('### getChats error!', err);
          throw err;
        }),
        map(actions => {
            console.log(`fetched ${actions.length} chat(s)`);
            return actions.map((a: any) => {
              const data = a.payload.doc.data();
              const userChatKey = a.payload.doc.id;
              return this.getOneChat(data.id, userChatKey);
            });
          }
        )
      );
  }

  /**
   * returns an observable of the actual chat instance.
   * @param id the chat id
   * @param userChatKey the database id where the the chat id is stored under the user document
   */
  getOneChat(id, userChatKey = null) {
    console.log(`getting one chat ${id}...`);
    return this.db
      .doc(`chats/${id}`) // TODO check if the doc exists first?
      .snapshotChanges()
      .pipe(
        catchError(err => {
          console.log('### getOneChat error!', err);
          throw err;
        }),
        take(1),
        map(changes => {
          console.log(`got one chat ${id}`);
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
    console.log(`fetching chat messages for ${chatId}...`);
    return this.db
      .collection(`chats/${chatId}/messages`, ref => ref.orderBy('createdAt'))
      .snapshotChanges()
      .pipe(
        catchError(err => {
          console.log('getChats error!###', err);
          throw err;
        }),
        map(actions => {
          console.log(`fetched ${actions.length} chat messages...`);
          return actions.map(a => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...data };
          });
        })
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
