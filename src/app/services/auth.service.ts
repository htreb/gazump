import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { BehaviorSubject, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { FcmService } from './fcm.service';

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
  ) {
    this.authStateSubscription = this.authState().subscribe();
  }

  get loading() {
    return this.showPageLoadingSpinner;
  }

  set loading(loading: boolean) {
    this.showPageLoadingSpinner = loading;
  }

  authState() {
    return this.afAuth.authState.pipe(tap(user => {
      if (user) {
        this.subToUserDoc(user.uid);
        this.userId$.next(user.uid);
        this.fcmPermissionSub = this.fcmService.getPermission(user.uid).subscribe();
        this.fcmListenSub = this.fcmService.listenToMessages().subscribe();
      } else {
        this.userId$.next({ loading: true });
        this.unSubFromUserDoc();
        this.unSubFromFcm();
      }
    }));
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
          console.log('subscribed to userDoc but got no doc!', userDoc);
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
          role: 'USER', // TODO some way of giving users another role
          permissions: [],
          connections: {},
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          userName: email.substr(0, email.indexOf('@')) // TODO some way of letting users change their userName
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

  /**
   * Checks if a user matches the given permissions.
   * @param permissions array of required permissions
   */
  hasPermissions(permissions: string[]): boolean {
    // if (!this.currentUser || !this.currentUser.value.permissions) {
    //   return false;
    // }
    // // filters the permissions to an array of all that the user does not have.
    // // If that array is not 0 long then deny permission.
    // return permissions.filter(p => this.currentUser.value.permissions.indexOf(p) === -1).length === 0;
    return true;
  }

  /**
   * checks firebase for a match on a given userName
   * @param name requested name
   */
  isUserNameAvailable(name: string) {
    // return this.db.collection('users', ref => ref.where('userName', '==', name).limit(1)).valueChanges().pipe(
    //   take(1),
    //   map(user => {
    //     return user;
    //   })
    // );
  }

  /**
   * changes the currently logged in users userName
   * @param userName new userName
   */
  updateUserName(userName: string) {
    // return this.db.doc(`users/${this.currentUser.value.id}`).update({
    //   userName
    // });
  }
}
