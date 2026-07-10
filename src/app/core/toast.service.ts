import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: number;
  type: 'ok' | 'err' | 'info' | 'warn';
  title: string;
  body?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = new BehaviorSubject<ToastMessage[]>([]);
  toasts$ = this._toasts.asObservable();
  private nextId = 1;

  show(title: string, body?: string | null, type: ToastMessage['type'] = 'info') {
    const id = this.nextId++;
    const toast: ToastMessage = { id, type, title, body };
    this._toasts.next([...this._toasts.value, toast]);

    setTimeout(() => {
      this.dismiss(id);
    }, 4000);
  }

  success(title: string, body?: string | null) {
    this.show(title, body, 'ok');
  }

  error(title: string, body?: string | null) {
    this.show(title, body, 'err');
  }

  info(title: string, body?: string | null) {
    this.show(title, body, 'info');
  }

  warn(title: string, body?: string | null) {
    this.show(title, body, 'warn');
  }

  dismiss(id: number) {
    this._toasts.next(this._toasts.value.filter((t) => t.id !== id));
  }
}
