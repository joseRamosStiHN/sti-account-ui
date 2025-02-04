
import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { NavigationService } from "src/app/shared/navigation.service";


export const AccountigGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> | boolean | UrlTree => {
   
   
    const navigationService = inject(NavigationService);
    const router = inject(Router);
    let isCompany = true

    const company  = localStorage.getItem('company') || ''; 
            
    if (company != '') {
        isCompany = true;
    } else{
        router.navigate(['/dashboard']);
    }
    return isCompany;

};