import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { PeriodModel } from 'src/app/modules/accounting/models/PeriodModel';
import { PeriodService } from 'src/app/modules/accounting/services/period.service';
import { confirm } from 'devextreme/ui/dialog';
import { ToastType } from 'devextreme/ui/toast';
import { typeToast } from 'src/app/modules/accounting/models/models';


const msInDay = 1000 * 60 * 60 * 24;
const now = new Date();
const pastNow = new Date();
const initialValue: [Date, Date] = [
  new Date(pastNow.getTime() - msInDay * 30),
  new Date(now.getTime()),
];

@Component({
  selector: 'app-period-list',
  templateUrl: './period-list.component.html',
  styleUrl: './period-list.component.css'
})
export class PeriodListComponent {

  editorOptions = {
    itemTemplate: 'accounts'
  };



  messageToast: string = '';
  showToast: boolean = false;
  toastType: ToastType = typeToast.Info;




  periodList$: Observable<PeriodModel[]> | undefined;

  typePeriods= [
    {id:0, name:"Mensual"},
    {id:1, name:"Trimestral"},
    {id:2, name:"Semestral"}
  ]

  private readonly router = inject(Router);
  private readonly periodoService = inject(PeriodService);

  currentValue!: (string | number | Date)[];
  roles: string[] = ['admin', 'teller'];


  ngOnInit(): void {
    this.currentValue = initialValue;

    this.periodList$ = this.getListPeriods();

  }

  onSearch(): void {

    let [dateInitStr, dateEndStr] = this.currentValue;
    const dateInit = new Date(dateInitStr);
    const dateEnd = new Date(dateEndStr);

    if (dateEnd < dateInit) {
      return;
    }

    const formatDate = (date: Date) => {
      const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      return offsetDate.toISOString().slice(0, 19);
    };

    const formattedDateInit = formatDate(dateInit);
    const formattedDateEnd = formatDate(dateEnd);
    this.periodList$ = this.periodoService.getPeridoBydate(formattedDateInit, formattedDateEnd)

  }




  onEditPeriod(e: any) {

    this.router.navigate(['/accounting/configuration/period/update', e.id]);
  }

  goToNewJournal = () => {
    this.router.navigate(['/accounting/configuration/period/create']);
  };


  currentValueChanged(event: any): void {
    const date: [Date, Date] = event.value;
    this.currentValue = date;
  };

  formatDateEnd(rowData: any): string {
    const date = new Date(rowData.endPeriod);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  formatDateInit(rowData: any): string {
    const date = new Date(rowData.startPeriod);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }


  async updatePeriod(data: any) {
    let dialogo = await confirm(`¿Está seguro de que desea activar este periodo?`, 'Advertencia');
    if (!dialogo) {
      data.data.status = false;
      return;
    }

    this.periodoService.updatePeriod(Number(data.data.id), data.data).subscribe({
      next: (data) => {
        this.toastType = typeToast.Success;
        this.messageToast = 'Registros actualizados exitosamente';
        this.showToast = true;

      },
      error: (err) => {
        console.error('Error creating transaction:', err);
        this.toastType = typeToast.Error;
        this.messageToast = 'Error al crear el periodo';
        this.showToast = true;
      },
    });
    this.periodList$ = undefined;

    setTimeout(() => {
      this.periodList$ = this.getListPeriods();
    }, 1000);


  }

  getListPeriods(): Observable<any[]> {

    // return this.periodoService.getAllPeriods().pipe(
    //   map(data => {
    //     data.map(nuevo => {
        
    //     const status = nuevo.closureType?.toUpperCase() == "ANUAL" ? nuevo.status = true : nuevo.status;
    //      const isClosed=  nuevo.isClosed == null ? false : true;

    //      return { ...nuevo,status, isClosed}

        
    //     })
        
    //     return data
    //   })
      
    // );

    return this.periodoService.getAllPeriods().pipe(
      map(data => {

        const transformedData = data.map(nuevo => {
          const status = nuevo.closureType?.toUpperCase() === "ANUAL" || nuevo.periodStatus.toUpperCase() == "ACTIVE" ? true :false;
          const isClosed = nuevo.periodStatus == "CLOSED" ? true : false;
          return { ...nuevo, status, isClosed };
        });
    

        const groupedByClosureType = transformedData.reduce((acc, period) => {
          const closureType = period.closureType || 'Otros';
          if (!acc[closureType]) {
            acc[closureType] = [];
          }
          acc[closureType].push(period);
          return acc;
        }, {} as { [key: string]: any[] });
    

        const result = Object.entries(groupedByClosureType).map(([key, periods], index) => ({
          id: index + 1,
          name: key,   
          periods  
        }));


        console.log(result);
        
    
        return result;
      })
    );
    
  }
}
