import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-company-create',
  templateUrl: './company-create.component.html',
  styleUrl: './company-create.component.css',
})
export class CompanyCreateComponent implements OnInit {
  accountsFromSystem: boolean = true;

  ngOnInit(): void {}
  onAccountConfig(event: Event) {
    const data = event.target as HTMLInputElement;
    this.accountsFromSystem = Boolean(parseInt(data.value));
  }
}
