import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';
import * as firebase from 'firebase/app';
import isEqual from 'lodash.isequal';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private currentGroupSub: Subscription;
  public currentGroupSubject = new BehaviorSubject<any>({ loading: true });
  private groupsSub: Subscription;
  public allGroupsSubject = new BehaviorSubject<any>({ loading: true });
  public showGroupMenuItems = true;

  constructor(
    private db: AngularFirestore,
    private auth: AuthService,
    private router: Router
  ) {
    const updateCurrentGroupSubjectFromUrl = (url: string) => {
      const urlSegments = url.split('/');
      const groupIndex = urlSegments.indexOf('group');
      if (groupIndex > -1) {
        return this.setCurrentGroup(urlSegments[groupIndex + 1]);
      }
    };

    // ugly way to keep in sync with the router from a service, activatedRoute doesn't work from here.
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((events: NavigationEnd) => {
        updateCurrentGroupSubjectFromUrl(events.urlAfterRedirects);
      });

    // sometimes get need a group before any navigationEnd events (filtering tickets on chat page)
    // so set initial group here.
    updateCurrentGroupSubjectFromUrl(this.router.url);

    this.auth.userId$.subscribe(userId => {
      if (userId.loading) {
        return;
      }
      return userId ? this.subscribeToUsersGroups(userId) : this.unSubFromUsersGroup();
    });
  }

  get currentGroupId() {
    return this.currentGroupSubject.value.id;
  }
  /**
   * Gets all groups the logged in user is a member of
   * and saves them in the allGroupsSubject
   */
  subscribeToUsersGroups(userId: string) {
    if (this.groupsSub) {
      return;
    }
    this.groupsSub = this.db
      .collection('groups', ref =>
        ref.where('members', 'array-contains', userId)
      )
      .valueChanges({ idField: 'id' })
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
    this.unSubFromCurrentGroup();
  }

  unSubFromCurrentGroup() {
    if (this.currentGroupSub && this.currentGroupSub.unsubscribe) {
      this.currentGroupSub.unsubscribe();
    }
    this.currentGroupSub = null;
    this.currentGroupSubject.next({ loading: true });
  }

  setCurrentGroup(id: any) {
    // if no id 'i.e' nav-ing back to list groups. then do not clear the currentGroupSubject
    // or it will be another db read and slow down coming back to the boards for the same group.
    // if we're not changing groups just let it be.
    if (id && id !== this.currentGroupId) {
      this.currentGroupSub = this.allGroupsSubject
        .subscribe(allGroups => {
          if (!allGroups.loading) {
            const matchingGroup =
              allGroups.filter(group => group.id === id)[0];
            if (!matchingGroup) {
              // user is not a member of that group.
              this.router.navigateByUrl('/');
            } else if (!isEqual(this.currentGroupSubject.value, matchingGroup)) {
              // only emit a change if we actually have a different group.
              this.currentGroupSubject.next(matchingGroup);
            }
          }
        });
    }
  }

  /**
   * creates a new group with title and users provided
   * @param title group name
   * @param users array of user detail objects
   */
  createGroup(title: string, users: string[], admins: string[]) {
    return this.db.collection('groups').add({
      title,
      members: [ this.auth.userId$.value, ...users ],
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      admins: [ this.auth.userId$.value, ...admins ]
    });
  }

  editGroup(groupId: string, title: string, members: string[], admins: string[]) {
    return this.db.collection('groups')
      .doc(groupId)
      .update({
        title,
        members,
        admins
      });
  }

  deleteGroup(groupId) {
    return this.db.collection('groups')
      .doc(groupId)
      .delete();
  }

  leaveGroup(groupId) {
    return this.db.collection('groups')
    .doc(groupId)
    .update({
      members: firebase.firestore.FieldValue.arrayRemove(this.auth.userId$.value)
    });
  }
}
