import { Component, inject } from '@angular/core';
import { NgForm } from '@angular/forms';
import { type } from 'os';
import { JournalModel } from 'src/app/modules/accounting/models/JournalModel';

@Component({
  selector: 'app-journal-page',
  templateUrl: './journal-page.component.html',
  styleUrl: './journal-page.component.css'
})
export class JournalPageComponent {

  journalForm: JournalModel;


  journalTypes:string[]= ["Ventas","Compras","Efectivo","Bancos","Varios"]


  constructor(){
    this.journalForm={
      id: 0,
      name: "",
      type: "",
      code: "",
      accountCash:"",
      accountPredeterminate: "",
      transitAccount:"",
      lossAccount:"",
      profitAccount:"",
      bankAccount:"",
      accountNumber: "",
      status: true
  };
}

  onSubmit(e: NgForm) {
    
  }


}
