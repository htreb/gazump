import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, Subject } from 'rxjs';
import { takeWhile, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    this.auth.loading = true;
    console.log(`starting authGuard userDoc is`, this.auth.userDocSubject.value);

    const foundUserDoc$ = new Subject<boolean>();
    this.auth.userDocSubject.pipe(
      takeWhile(userDoc => {
        console.log(`in auth guard takeWhile, current userDoc`, userDoc);
        return userDoc.loading;
      }),
      finalize(() => {
        const docExists = !!this.auth.userDocSubject.value;
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
