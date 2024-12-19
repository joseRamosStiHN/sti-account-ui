import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Login } from 'src/app/shared/models/LoginResponseModel';

@Injectable({
  providedIn: 'root',
})
export class UserInfoService {
  private userInfo = new BehaviorSubject<Login | null>(null);
  userDetail$ = this.userInfo.asObservable();

  constructor() {}

  setUserInfo(info: Login) {
    this.userInfo.next(info);
  }
}
