import { inject } from "@angular/core";
import { CanActivateFn, Router, ActivatedRouteSnapshot } from "@angular/router";
import { map, take } from "rxjs/operators";
import { CompaniesService } from "src/app/modules/companies/companies.service";

export const RoleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
    const companyService = inject(CompaniesService);
    const router = inject(Router);
    const requiredRoles = route.data['roles'] as Array<string>;

    if (!requiredRoles || requiredRoles.length === 0) {
        return true;
    }

    return companyService.companyLogin$.pipe(
        take(1),
        map(company => {
            if (!company) {
                return router.createUrlTree(['/unauthorized']);
            }

            const hasRequiredRole = company.roles?.some(role =>
                requiredRoles.includes(role.name)
            );

            return hasRequiredRole || router.createUrlTree(['/unauthorized']);
        })
    );
};