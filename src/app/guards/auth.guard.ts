import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { take, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private auth: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const expectedRoles = route.data.roles;
    return this.auth.user.pipe(
      take(1),
      map(user => {
        if (!user || expectedRoles.indexOf(user.role) < 0) {
          this.router.navigateByUrl('/login');
          return false;
        }
        return true;
      })
    );
  }

}
