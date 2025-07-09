import { inject } from "@angular/core";
import { CanActivateFn, Router, ActivatedRouteSnapshot, UrlTree } from "@angular/router";
import { Observable, of } from "rxjs";
import { catchError, filter, map, take } from "rxjs/operators";
import { CompaniesService } from "src/app/modules/companies/companies.service";

export const RoleGuard: CanActivateFn = (route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> => {
    const companyService = inject(CompaniesService);
    const router = inject(Router);
    const requiredRoles = route.data['roles'] as Array<string>;

    if (!requiredRoles || requiredRoles.length === 0) {
        return of(true);
    }

    return companyService.companyLogin$.pipe(
        filter(company => company !== null),
        take(1),
        map(company => {
            const hasRequiredRole = company?.roles?.some(role =>
                requiredRoles.includes(role.name)
            );
            return hasRequiredRole || router.createUrlTree(['/unauthorized']);
        }),
        catchError(() => of(router.createUrlTree(['/unauthorized'])))
    );
};