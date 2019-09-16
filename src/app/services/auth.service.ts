import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { from, Observable, of, BehaviorSubject, Subject } from 'rxjs';
import { switchMap, take, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user: Observable<any>;
  currentUser = new BehaviorSubject(null);
  loggedOutSubject: Subject<any> = new Subject();

  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFirestore,
    private router: Router
  ) {
    // subscribe to current logged in user, find them in the users table and return
    // an observable containing the id in the database.
    this.user = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.db
            .doc(`users/${user.uid}`)
            .valueChanges()
            .pipe(
              take(1),
              tap((data: any) => {
                console.log('Data is:•••••••••••••', data);
                console.log('User is:•••••••••••••', user);
                data.id = user.uid;
                this.currentUser.next(data);
              })
            );
        } else {
          this.currentUser.next(null);
          return of(null);
        }
      })
    );

    this.afAuth.authState.subscribe(user => {
      if (!user) {
        console.log('got no user in the auth service emitting loggedOutSubject...', user);
        this.loggedOutSubject.next();
        // this.loggedOutSubject.complete(); // TODO! ticket #23
      }
    });
  }

  /**
   * logs in a current user with email and password and returns the corresponding user from the users database
   * @param email string
   * @param password string
   */
  logIn(email: string, password: string): Observable<any> {
    return from(
      this.afAuth.auth.signInWithEmailAndPassword(email, password)
    ).pipe(
      switchMap(data => {
        if (data) {
          return this.db
            .doc(`users/${data.user.uid}`)
            .valueChanges()
            .pipe(take(1));
        } else {
          return of(null);
        }
      })
    );
  }

  /**
   * Signs up a new user with email and password, and creates a new entry in the users database
   * @param email string
   * @param password string
   */
  signUp(email: string, password: string): Observable<any> {
    email = email.toLowerCase();
    return from(
      this.afAuth.auth.createUserWithEmailAndPassword(email, password)
    ).pipe(
      switchMap(data => {
        if (!data || !data.user) {
          console.log(
            'something has gone wrong signing up the new user, we shouldn\'t get here'
          );
          return of(null);
        }
        return from(
          this.db.doc(`users/${data.user.uid}`).set({
            email,
            role: 'USER', // TODO some way of giving users another role
            permissions: [],
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            userName: 'colin' // TODO some way of letting users change their userName
          })
        ).pipe( // TODO does the set above this not return this info?
          switchMap(() => {
            return this.db
              .doc(`users/${data.user.uid}`)
              .valueChanges()
              .pipe(take(1));
          })
        );
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
  logOut(): void {
    this.afAuth.auth.signOut();
    this.router.navigateByUrl('/login');
  }

  /**
   * Checks if a user matches the given permissions.
   * @param permissions array of required permissions
   */
  hasPermissions(permissions: string[]): boolean {
    if (!this.currentUser || !this.currentUser.value.permissions) {
      return false;
    }
    // filters the permissions to an array of all that the user does not have.
    // If that array is not 0 long then deny permission.
    return permissions.filter(p => this.currentUser.value.permissions.indexOf(p) === -1).length === 0;
  }

  /**
   * checks firebase for a match on a given userName
   * @param name requested name
   */
  isUserNameAvailable(name: string) {
    return this.db.collection('users', ref => ref.where('userName', '==', name).limit(1)).valueChanges().pipe(
      take(1),
      map(user => {
        return user;
      })
    );
  }

  /**
   * changes the currently logged in users userName
   * @param userName new userName
   */
  updateUserName(userName: string) {
    return this.db.doc(`users/${this.currentUser.value.id}`).update({
      userName
    });
  }
}
