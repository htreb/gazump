import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';
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
    const updateGroupFromUrl = (url: string) => {
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
        updateGroupFromUrl(events.urlAfterRedirects);
      });

    // sometimes get need a group before any navigationEnd events (filtering tickets on chat page)
    // so set initial group here.
    updateGroupFromUrl(this.router.url);
  }

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
    // just to be sure
    this.subscribeToUsersGroups();
    // if no id 'i.e' nav-ing back to list groups. then do not clear the currentGroupSubject
    // or it will be another db read and slow down coming back to the boards for the same group.
    // if we're not changing groups just let it be.
    if (id && id !== this.currentGroupId) {
      this.currentGroupSub = this.allGroupsSubject
        .pipe(takeUntil(this.auth.loggedOutSubject))
        .subscribe(allGroups => {
          if (!allGroups.loading) {
            const matchingGroup =
              allGroups.filter(group => group.id === id)[0] || {};
            // only emit a change if we actually have a different group.
            if (!isEqual(this.currentGroupSubject.value, matchingGroup)) {
              this.currentGroupSubject.next(matchingGroup);
            }
          }
        });
    }
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
