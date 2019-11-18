import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { FcmService } from './fcm.service';
import { AngularFireFunctions } from '@angular/fire/functions';
import { callbackify } from 'util';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private showPageLoadingSpinner = false;
  authStateSubscription: Subscription;
  userDocSubscription: Subscription;
  userDoc$ = new BehaviorSubject<any>({ loading: true });
  userId$ = new BehaviorSubject<any>({ loading: true });

  private fcmPermissionSub: Subscription;
  private fcmListenSub: Subscription;

  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFirestore,
    private router: Router,
    private fcmService: FcmService,
    private fun: AngularFireFunctions,
  ) {
    this.authStateSubscription = this.authState().subscribe(user => {
      if (user) {
        this.subToUserDoc(user.uid);
        this.userId$.next(user.uid);
        this.fcmPermissionSub = this.fcmService.getPermission(user.uid).subscribe();
        this.fcmListenSub = this.fcmService.listenToMessages().subscribe();
      } else {
        this.userId$.next(false);
        this.unSubFromUserDoc();
        this.unSubFromFcm();
      }
    });
  }

  get loading() {
    return this.showPageLoadingSpinner;
  }

  set loading(loading: boolean) {
    this.showPageLoadingSpinner = loading;
  }

  authState() {
    return this.afAuth.authState;
  }

  /**
   * subscribe to current logged in user, find them in the users table and return
   * an observable containing the id in the database.
   */
  subToUserDoc(userId: string) {
    if (this.userDocSubscription) {
      return;
    }
    this.userDocSubscription = this.db
    .collection('users')
    .doc(userId)
    .valueChanges()
    .subscribe(userDoc => {
      if (userDoc) {
          this.userDoc$.next({ ...userDoc, id: userId });
        } else {
          // subscribed to userDoc but got no doc!
        }
      });
  }

  unSubFromUserDoc() {
    if (this.userDocSubscription && this.userDocSubscription.unsubscribe) {
      this.userDocSubscription.unsubscribe();
    }
    this.userDocSubscription = null;
    this.userDoc$.next({ loading: true });
  }

  unSubFromFcm() {
    if (this.fcmPermissionSub && this.fcmPermissionSub.unsubscribe) {
      this.fcmPermissionSub.unsubscribe();
    }
    if (this.fcmListenSub && this.fcmListenSub.unsubscribe) {
      this.fcmListenSub.unsubscribe();
    }
  }

  /**
   * logs in a current user with email and password
   * @param email string
   * @param password string
   */
  logIn(email: string, password: string) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password);
  }

  /**
   * Signs up a new user with email and password, and creates a new entry in the users database
   * @param email string
   * @param password string
   */
  signUp(email: string, password: string) {
    email = email.toLowerCase();
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password)
      .then(data =>
        this.db.doc(`users/${data.user.uid}`).set({
          email,
          permissions: [],
          connections: {},
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          userName: email.substr(0, email.indexOf('@')),
          notifyContactRequest: true,
          notifyChatMessage: true,
          notifyBoardChanges: true,
          importantAlert: true,
        })
      );
  }

  /**
   * Sends a password reset email to the email address (if there is a user linked to it)
   * @param email string
   */
  sendResetEmail(email: string): Promise<any> {
    return this.afAuth.auth.sendPasswordResetEmail(email);
  }

  /**
   * Signs out the currently logged in user
   */
  async logOut() {
    this.loading = true;
    await this.fcmService.removeCurrentTokenOnSignOut(this.userId$.value);
    this.afAuth.auth.signOut();
    this.router.navigateByUrl('/login'); // TODO make this a 'root' direction?
    this.loading = false;
  }

  notifyContactRequest(shouldNotify) {
    // TODO update cloud func to check this value before notifying
    return this.db
      .collection('users')
      .doc(this.userId$.value)
      .update({
        notifyContactRequest: shouldNotify
      });
  }

  notifyChatMessage(shouldNotify) {
    // TODO update cloud func to check this value before notifying
    return this.db
    .collection('users')
    .doc(this.userId$.value)
    .update({
      notifyChatMessage: shouldNotify
    });
  }

  notifyBoardChanges(shouldNotify) {
    // TODO cloud function notify on board changes
    return this.db
    .collection('users')
    .doc(this.userId$.value)
    .update({
      notifyBoardChanges: shouldNotify
    });
  }

  /**
   * Calls the cloud function to change the currently logged in users userName
   * and the name on all their contacts docs.
   * @param userName new userName
   */
  updateUserName(userName: string, callBack?: any) {
    if (userName === this.userDoc$.value.userName) {
      if (typeof callBack === 'function') {
        callBack();
      }
      return;
    }
    return this.fun.httpsCallable('updateUserName')({ userName })
    .subscribe(resp => {
      if (typeof callBack === 'function') {
        callBack(resp);
      }
    });
  }
}
