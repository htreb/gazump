import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './services/auth.service';
import { Subscription, BehaviorSubject } from 'rxjs';
import * as firebase from 'firebase/app';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private chatsSub: Subscription;
  public allChatsSubject = new BehaviorSubject<any>({ loading: true });

  constructor(private db: AngularFirestore, private auth: AuthService) {
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

  allChatsUnderGroup(groupId: string) {
    return this.allChatsSubject.pipe(
      map(allChats => {
        return allChats.filter(chat => chat.groupId === groupId);
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
    return `${new Date().getTime()}_${Math.floor(Math.random() * 1000000)}`;
  }

  addChatMessage(chatId: string, message: any) {
    return this.db
      .collection('chats')
      .doc(chatId)
      .update({
        [`messages.${this.getId()}`]: {
          from: this.auth.currentUser.value.id,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          message
        }
      });
  }
}
