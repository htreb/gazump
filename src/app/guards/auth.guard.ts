import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { take, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    this.auth.loading = true;
    return this.auth.getCurrentUser().pipe(
      take(1),
      map((user: any) => {
        // give the new page a chance to load behind
        setTimeout(() => {this.auth.loading = false; }, 800);
        return !!user;
      }));
  }
}
