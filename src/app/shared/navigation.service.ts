import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CompanyResponse } from 'src/app/modules/companies/models/ApiModelsCompanies';

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

  private company$ = new BehaviorSubject<any>({});
  companyNavigation = this.company$.asObservable();

  constructor() {}

  setNavLinks(links: NavStiLink[]) {
    this.navLinksSource.next(links);
  }

  setNameCompany(company: any) {
    this.company$.next(company);
  }
}
