import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  email: string;
  roleId: number;
  roleName: string;
  initials: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(private router: Router) {
    const savedUser = localStorage.getItem('dpdpa_user');
    if (savedUser) {
      try {
        this.currentUserSubject.next(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('dpdpa_user');
      }
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public login(email: string, roleId: number, roleName: string): boolean {
    const initials = email.split('@')[0].substring(0, 2).toUpperCase() || 'US';
    const user: User = {
      email,
      roleId,
      roleName,
      initials
    };

    localStorage.setItem('dpdpa_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
    return true;
  }

  public logout() {
    localStorage.removeItem('dpdpa_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  public isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }
}
