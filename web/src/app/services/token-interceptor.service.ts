import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap } from 'rxjs/operators';

import { AuthService } from './auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  public cachedRequests = [];

  constructor(private authService: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authReq = setAccessToken(req, this.authService.clientToken);
    return next.handle(authReq).pipe(
      filter((event: HttpEvent<any>) => event instanceof HttpResponse),
      catchError((err: any, caught: Observable<HttpEvent<any>>) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            return this.authService.getNewClientToken().pipe(
              switchMap(res => next.handle(setAccessToken(req, res.token)))
            );
          } else if (err.status === 403) {
            this.authService.clearAuth();
            return caught;
          } else {
            return caught;
          }
        } else {
          return throwError(err);
        }
      })
    );
  }
}

function setAccessToken(req: HttpRequest<any>, token: string) {
  return req.clone({
    setHeaders: {
      'x-access-token': token
    }
  });
}
