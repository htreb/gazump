import { Injectable } from '@angular/core';
import { GroupService } from './services/group.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './services/auth.service';
import { takeUntil, switchMap } from 'rxjs/operators';
import { Subscription, BehaviorSubject, of } from 'rxjs';

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
    this.subscribeToChats();
  }

  subscribeToChats() {
    if (this.chatsSub) {
      return;
    }
    this.chatsSub = this.groupService.currentGroupSubject
      .pipe(
        takeUntil(this.auth.loggedOutSubject),
        switchMap(group => {
          if (group.loading) {
            return of(group);
          }
          if (!group.id) {
            return of([]);
          }
          this.allChatsSubject.next({ loading: true });
          return this.db
            .collection('groups')
            .doc(group.id)
            .collection('chats', ref =>
              ref.orderBy(`members.${this.auth.currentUser.value.id}`)
            )
            .valueChanges({ idField: 'id' });
        })
      )
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
}
