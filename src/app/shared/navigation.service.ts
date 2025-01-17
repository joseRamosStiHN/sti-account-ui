import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface NavStiLink {
  label: string;
  path: string;
  child?: NavStiLink[];
}

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private navLinksSource = new BehaviorSubject<NavStiLink[]>([]);
  navLinks$ = this.navLinksSource.asObservable();

  private nameCompany = new BehaviorSubject<string>('');
  nameCompany$ = this.nameCompany.asObservable();

  constructor() {}

  setNavLinks(links: NavStiLink[]) {
    this.navLinksSource.next(links);
  }

  setNameCompany(name: string) {
    this.nameCompany.next(name);
  }
}
