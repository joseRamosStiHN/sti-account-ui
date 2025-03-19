
import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { CompaniesService } from "src/app/modules/companies/companies.service";


export const AccountigGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> | boolean | UrlTree => {

    const companyService = inject(CompaniesService);
    const router = inject(Router);
    let isCompany = true
    const companyStorage = localStorage.getItem('company') || '';
    const savedUser = localStorage.getItem('userData');

    if (companyStorage != '') {

        if (!companyService.getCompany()) {
            if (savedUser) {
                const company = JSON.parse(companyStorage);
                isCompany = saveCompanyInMemory( company.id);
            }
        }

        isCompany = true;
    } else {
        router.navigate(['/dashboard']);
    }
    return isCompany;

};


function saveCompanyInMemory(idCompany: number): boolean {

    const companyService = inject(CompaniesService);
    let logging = false;

    companyService.getCompanyByUser(idCompany).subscribe({
        next: (data) => {
            if (data) {

                const { roles, ...companyData } = data;
                localStorage.setItem('company', JSON.stringify(companyData));

                companyService.setCompany(data);
                logging = true;

            } else {

                logging = false;
            }
        },
        error: (error) => {
            console.error('Error al obtener usuario:', error);
            logging = false;
        }
    });

    return logging;
}
