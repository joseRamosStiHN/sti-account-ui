
import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { CompaniesService } from "src/app/modules/companies/companies.service";
import { AuthServiceService } from "src/app/modules/login/auth-service.service";
import { UsersService } from "src/app/modules/users/users.service";
import { Company } from "src/app/shared/models/LoginResponseModel";
import { NavigationService } from "src/app/shared/navigation.service";


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
                const usuario = JSON.parse(savedUser);
                const company = JSON.parse(companyStorage);
               isCompany = saveCompanyInMemory(usuario.id, company.company.id);
            }
        }

        isCompany = true;
    } else {
        router.navigate(['/dashboard']);
    }
    return isCompany;

};


function saveCompanyInMemory(userId: number, idCompany: number): boolean {
    const userService = inject(UsersService);
    const companyService = inject(CompaniesService);

    let logging = false;

    userService.getUSerById(userId).subscribe({
        next: (data) => {
            if (data) {
                const companie = data.companies.find((com: any) => com.company.id === idCompany);

                if (companie) {
                    const { roles, ...companyData } = companie;
                    localStorage.setItem('company', JSON.stringify(companyData));
                    companyService.setCompany(companie);
                    logging = true; 
                } else {
        
                    logging = false;
                }
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
