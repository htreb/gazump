import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Subscription, BehaviorSubject, combineLatest } from 'rxjs';
import * as firebase from 'firebase/app';
import { map } from 'rxjs/operators';
import { ContactService } from './contact.service';
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
    private contactService: ContactService,
    private groupService: GroupService
  ) {
    this.subscribeToChats();
  }

  subscribeToChats() {
    if (this.chatsSub) {
      return;
    }
    this.chatsSub = this.db
      .collection('chats', ref =>
        ref.orderBy(`members.${this.auth.currentUser.value.id}`)
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
        return allChats.filter(chat => chat.id === chatId)[0];
      })
    );
  }

  getId() {
    return `${(Math.random() + '').substr(2)}X${new Date().getTime()}`;
  }

  startChat(title: string, membersArray: any) {
    membersArray.push(this.contactService.getMe());
    const membersMap = {};
    membersArray.forEach(
      m =>
        (membersMap[m.id] = {
          userName: m.userName,
          email: m.email,
          joined: firebase.firestore.FieldValue.serverTimestamp()
        })
    );

    return this.db.collection('chats').add({
      title,
      groupId: this.groupService.currentGroupId,
      members: membersMap,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      linkedTickets: {}
    });
  }

  addChatMessage(chatId: string, message: any, tickets: any[] = null) {
    const messageId = this.getId();
    const updateObject: any = {
      [`messages.${messageId}`]: {
        from: this.auth.currentUser.value.id,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        message,
        tickets
      }
    };
    if (tickets) {
      tickets.forEach(ticket => {
        updateObject[
          `linkedTickets.${ticket.id}`
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
      return [];
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
