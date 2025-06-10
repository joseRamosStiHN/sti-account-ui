import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthServiceService } from "src/app/modules/login/auth-service.service";

export const AdminGuard: CanActivateFn = (): boolean => {
    const router = inject(Router);

    const isAdmin = JSON.parse(localStorage.getItem('isAdmin') || 'false');
    if (isAdmin) {
        return true;
    }
    
    router.navigate(['/unauthorized']);
    return false;
};