import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { take, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  /**
   * This flag is picked up by the app component and is used to display the page-loading-spinner
   * while the auth check is going on
   */
  public loading = false;

  constructor(private router: Router, private auth: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    this.loading = true;
    const expectedRoles = route.data.roles;
    return this.auth.user.pipe(
      take(1),
      map(user => {
        this.loading = false;
        if (!user || expectedRoles.indexOf(user.role) < 0) {
          this.router.navigateByUrl('/login');
          return false;
        }
        return true;
      })
    );
  }
}
