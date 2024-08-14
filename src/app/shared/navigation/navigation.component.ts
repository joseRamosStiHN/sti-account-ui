import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NavigationService, NavStiLink } from '../navigation.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css',
})
export class NavigationComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  nav!: NavStiLink[];

  private navigate = inject(NavigationService);
  constructor() {}

  ngOnInit(): void {
    this.subscription.add(
      this.navigate.navLinks$.subscribe((links) => {
        this.nav = links;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
