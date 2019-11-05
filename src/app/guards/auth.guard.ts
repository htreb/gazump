import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, Subject } from 'rxjs';
import { takeWhile, finalize, delay, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    this.auth.loading = true;
    const foundUserDoc$ = new Subject<boolean>();

    // check they are signed in first
    this.auth.authState().pipe(take(1)).subscribe(user => {
      if (!user) {
        this.auth.logOut();
        foundUserDoc$.next(false);
      }
    });

    this.auth.userDoc$.pipe(
      // Need to delay because if we already have the user doc, this executes synchronously
      // the foundUserDoc$ subject emits before the function returns.
      // and never emits again, so the page never loads.
      delay(0),
      takeWhile(userDoc => {
        console.log(`in auth guard takeWhile, current userDoc`, userDoc);
        return userDoc.loading;
      }),
      finalize(() => {
        const docExists = !!this.auth.userDoc$.value;
        console.log(`finalize in authGuard userDoc val is ${docExists}`);
        if (!docExists) {
          this.auth.logOut();
        }
        // give the new page a chance to load behind
        setTimeout(() => { this.auth.loading = false; }, 800);
        foundUserDoc$.next(docExists);
      })).subscribe();

    return foundUserDoc$;
  }
}
