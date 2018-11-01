import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap } from 'rxjs/operators';

import { AuthService } from './auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  public cachedRequests = [];

  constructor(private authService: AuthService) { }

  // intercepts any http requests going from the client to the REST API
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // sets the clientToken in the headers of the request being sent
    const authReq = setAccessToken(req, this.authService.clientToken);
    // sends off the request with the proper headers
    return next.handle(authReq).pipe(
      // filter for HttpResponses from the API
      filter((event: HttpEvent<any>) => event instanceof HttpResponse),
      // catches any http errors
      catchError((err: any, _caught: Observable<HttpEvent<any>>) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            // if it's a 401 response the clientToken expired
            // grab a new clientToken and attach the new token to the request and send it off again
            return this.authService.getNewClientToken().pipe(
              switchMap(res => next.handle(setAccessToken(req, res.token)))
            );
          } else if (err.status === 403) {
            // require the user to login again, since their refreshToken expired
            this.authService.clearAuth();
            return throwError(err);
          } else {
            return throwError(err);
          }
        } else {
          return throwError(err);
        }
      })
    );
  }
}

function setAccessToken(req: HttpRequest<any>, token: string) {
  // sets the clientToken on the request's header
  return req.clone({
    setHeaders: {
      'x-access-token': token
    }
  });
}
