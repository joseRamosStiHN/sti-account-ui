import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header.component';
import { RouterModule, RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../shared/footer/footer.component';

import { filter, map } from 'rxjs/operators';
import { Router, ActivatedRoute, NavigationEnd, ActivatedRouteSnapshot } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent, BreadcrumbItemDirective } from 'xng-breadcrumb';

interface Breadcrumb {
  label: string;
  url: string;
}
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent,CommonModule,RouterModule,
     BreadcrumbComponent, BreadcrumbItemDirective],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent implements OnInit {

  breadcrumbs: Breadcrumb[] = [];

  constructor(private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.breadcrumbs = [];
      let route = this.activatedRoute.snapshot;
  
      while (route) {
        const data = route.data;
        if (data && data['breadcrumb']) {
          const breadcrumbLabel = data['breadcrumb'];
          const url = this.createUrl(route);
          this.breadcrumbs.unshift({ label: breadcrumbLabel, url });
        }
        if (route.firstChild) {
          route = route.firstChild;
        } else {
          break; // Si no hay más rutas hijas, sal del bucle
        }
      }
    });
  }
  
  private createUrl(route: ActivatedRouteSnapshot | null): string {
    const urlSegments: string[] = [];
    while (route) {
      const urlSegment = route.url.map(segment => segment.path).join('/');
      if (urlSegment) {
        urlSegments.unshift(urlSegment);
      }
      route = route.parent;
    }
    return '/' + urlSegments.join('/');
  }
}
 
