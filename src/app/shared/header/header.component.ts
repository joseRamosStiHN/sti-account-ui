import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { NavigationService, NavStiLink } from '../navigation.service';
import { DropdownComponent } from '../components/dropdown/dropdown.component';
import { AuthServiceService } from 'src/app/modules/login/auth-service.service';
import { CompaniesService } from 'src/app/modules/companies/companies.service';


@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    RouterModule,
    DropdownComponent,
  ],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  nav: NavStiLink[] = [];
  dropdownOpen = false;
  private readonly navigationService = inject(NavigationService);
  private authService = inject(AuthServiceService);

  companyId?: number;

  nameCompany?: string;

  companyLogoUrl?: string;

  logoLoaded = false;

  constructor(private navigate: NavigationService, private router: Router, private companiesService: CompaniesService) { }

  ngOnInit(): void {
    this.subscription.add(
      this.navigate.navLinks$.subscribe((links) => {
        this.nav = links;
      })
    );

    // To Do cargar imagen en header
    this.subscription.add(
      this.navigate.companyNavigation.subscribe((company) => {
        this.nameCompany = company.name
        this.companyId = company.id
        if (company.id && !this.logoLoaded) {
          this.loadCompanyLogo(company.id);
          this.logoLoaded = true;
        }
      })
    )



  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  goBack() {
    localStorage.removeItem('company');
    this.router.navigate(['/dashboard']);
    this.dropdownOpen = false;
  }

  logout() {
    this.authService.logout().subscribe({
      next: (data) => {
        localStorage.removeItem('userData');
        localStorage.removeItem('company');
        this.authService.setLogin({
          userName: '',
          active: false,
          companies: [],
          createdAt: new Date(),
          email: '',
          firstName: '',
          id: 0,
          lastName: '',
          globalRoles: []
        });

        this.dropdownOpen = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {

        console.log(err.error);

        console.log(err);
      }
    });
  }

  managePassword() {
    this.router.navigate(['/dashboard/user/manage-password']);
    this.dropdownOpen = false;
  }

  loadCompanyLogo(companyId: number) {
    this.companiesService.getCompanyLogo(companyId).subscribe({
      next: (logoBlob) => {
        this.createImageFromBlob(logoBlob);
      },
      error: (err) => {
        console.error('Error loading company logo:', err);
      }
    });
  }

  createImageFromBlob(image: Blob) {
    let reader = new FileReader();
    reader.addEventListener('load', () => {
      this.companyLogoUrl = reader.result as string;
    }, false);

    if (image) {
      reader.readAsDataURL(image);
    }
  }
}
