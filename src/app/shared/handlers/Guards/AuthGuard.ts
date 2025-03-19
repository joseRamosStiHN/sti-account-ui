
import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { AuthServiceService } from "src/app/modules/login/auth-service.service";


export const AuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> | boolean | UrlTree => {
            const authService = inject(AuthServiceService);
    
    
    const router = inject(Router);
    let isLoging = false

    authService.userAuthenticate$.subscribe((data => {
        if (data !=  null) {
            isLoging = true;
        } else {
            const savedUser = localStorage.getItem('userData');
            if (savedUser) {
                isLoging = true;
            } else{
                router.navigate(['/login']);
            }
        }
    }));
    return isLoging;

    

};