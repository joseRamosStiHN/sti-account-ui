import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface NavStiLink {
  label: string;
  path: string;
}

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private navLinksSource = new BehaviorSubject<NavStiLink[]>([]);
  navLinks$ = this.navLinksSource.asObservable();

  constructor() {}

  setNavLinks(links: NavStiLink[]) {
    this.navLinksSource.next(links);
  }
}
