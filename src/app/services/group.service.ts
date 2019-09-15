import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private currentGroupSub: Subscription;
  public currentGroupSubject = new BehaviorSubject<any>({ loading: true });
  private groupsSub: Subscription;
  public allGroupsSubject = new BehaviorSubject<any>({ loading: true });

  constructor(private db: AngularFirestore, private auth: AuthService) {}

  get currentGroupId() {
    return this.currentGroupSubject.value.id;
  }
  /**
   * Gets all groups the logged in user is a member of
   * and saves them in the allGroupsSubject
   */
  subscribeToUsersGroups() {
    if (this.groupsSub) {
      return;
    }
    this.groupsSub = this.db
      .collection('groups', ref =>
        ref.orderBy(`members.${this.auth.currentUser.value.id}`)
      )
      .valueChanges({ idField: 'id' })
      .pipe(takeUntil(this.auth.loggedOutSubject))
      .subscribe(groups => {
        this.allGroupsSubject.next(groups);
      });
  }

  /**
   * unsubscribes from all users groups.
   */
  unSubFromUsersGroup() {
    if (this.groupsSub && this.groupsSub.unsubscribe) {
      this.groupsSub.unsubscribe();
    }
    this.groupsSub = null;
    this.allGroupsSubject.next({ loading: true });

    if (this.currentGroupSub && this.currentGroupSub.unsubscribe) {
      this.currentGroupSub.unsubscribe();
    }
    this.currentGroupSub = null;
    this.currentGroupSubject.next({ loading: true });
  }

  setCurrentGroup(id: any) {
    this.subscribeToUsersGroups();
    this.currentGroupSub = this.allGroupsSubject
      .pipe(takeUntil(this.auth.loggedOutSubject))
      .subscribe(allGroups => {
        if (!allGroups.loading) {
          const matchingGroup = allGroups.filter(group => group.id === id)[0];
          this.currentGroupSubject.next(matchingGroup);
        }
      });
  }

  /**
   * creates a new group with title and users provided
   * @param title group name
   * @param users array of userIds
   */
  createGroup(title: string, users: string[]) {
    const allUsers = [this.auth.currentUser.value.id, ...users];
    return this.db.collection('groups').add({
      title,
      members: allUsers
    });
  }
}
