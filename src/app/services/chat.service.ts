import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Subscription, BehaviorSubject, combineLatest, of } from 'rxjs';
import * as firebase from 'firebase/app';
import { map } from 'rxjs/operators';
import { GroupService } from './group.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private chatsSub: Subscription;
  public allChatsSubject = new BehaviorSubject<any>({ loading: true });

  constructor(
    private db: AngularFirestore,
    private auth: AuthService,
    private groupService: GroupService
  ) {
    this.auth.userId$.subscribe(userId => {
      if (userId.loading) {
        return;
      }
      return userId ? this.subscribeToChats(userId) : this.unSubFromChats();
    });
  }

  subscribeToChats(userId) {
    if (this.chatsSub) {
      return;
    }
    this.chatsSub = this.db
      .collection('chats', ref =>
        ref.where('members', 'array-contains', userId)
        .orderBy('lastUpdated', 'desc')

      )
      .valueChanges({ idField: 'id' })
      .subscribe((chats: any) => {
        this.allChatsSubject.next(chats);
      });
  }

  unSubFromChats() {
    if (this.chatsSub && this.chatsSub.unsubscribe) {
      this.chatsSub.unsubscribe();
    }
    this.allChatsSubject.next({ loading: true });
    this.chatsSub = null;
  }

  allChatsUnderCurrentGroup() {
    return combineLatest([
      this.groupService.currentGroupSubject,
      this.allChatsSubject
    ]).pipe(
      map(([currentGroup, allChats]) => {
        return allChats.loading
          ? allChats
          : allChats.filter(
              chat => currentGroup.id && currentGroup.id === chat.groupId
            );
      })
    );
  }

  subToOneChat(chatId: string) {
    return this.allChatsSubject.pipe(
      map(allChats => {
        return allChats.loading
        ? allChats
        : allChats.filter(chat => chat.id === chatId)[0] || { noMatching: true };
      })
    );
  }

  startChat(title: string, membersWithoutMe: string[], admins: string[]) {
    return this.db.collection('chats').add({
      title,
      groupId: this.groupService.currentGroupId,
      members: [ this.auth.userId$.value, ...membersWithoutMe ],
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      linkedTickets: {},
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
      admins: [ this.auth.userId$.value, ...admins ],
    });
  }

  editChat(chatId: string, title: string, members: string[], admins: string[]) {
    return this.db.collection('chats')
      .doc(chatId)
      .update({
        title,
        members,
        admins
      });
  }

  leaveChat(chatId) {
    return this.db.collection('chats')
    .doc(chatId)
    .update({
      members: firebase.firestore.FieldValue.arrayRemove(this.auth.userId$.value)
    });
  }

  deleteChat(chatId) {
    return this.db.collection('chats')
      .doc(chatId)
      .delete();
  }

  addChatMessage(chatId: string, message: any, tickets: any[] = null) {
    const messageId = this.db.createId();
    const updateObject: any = {
      [`messages.${messageId}`]: {
        from: this.auth.userId$.value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        message,
        tickets
      },
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
    };
    if (tickets) {
      tickets.forEach(ticketId => {
        updateObject[
          `linkedTickets.${ticketId}`
        ] = firebase.firestore.FieldValue.arrayUnion({
          message,
          messageId
        });
      });
    }
    return this.db
      .collection('chats')
      .doc(chatId)
      .update(updateObject);
  }

  // NOT USED YET
  // linkTicketsToMessage(chatId: string, message: string, ticketIds: string[]) {
  //   const updateObject = {};
  //   ticketIds.forEach(ticketId => {
  //     updateObject[`linkedTickets.${ticketId}`] = firebase.firestore.FieldValue.arrayUnion({
  //       message
  //     });
  //   });
  //   return this.db
  //   .collection('chats')
  //   .doc(chatId)
  //   .update(updateObject);
  // }

  findChatsWhichMentionTicket(ticketId: string) {
    if (!ticketId) {
      return of([]);
    }
    return this.allChatsSubject.pipe(
      map(allChats => {
        if (allChats.loading) {
          return allChats;
        }
        return allChats.filter(chat => chat.linkedTickets[ticketId]);
      })
    );
  }
}
