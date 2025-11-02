import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // TODO: Replace with your actual token
  const authToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJrYW1pbC5wYXJ0eWthMTk5OEBnbWFpbC5jb20iLCJpYXQiOjE3NjIwOTQzNzgsImV4cCI6MTc2MjA5Nzk3OH0.Etu4gHV7D8BYdfGMWp0qIt9Tiwr3R6r6snT_bly4aN4';

  // Clone the request and add the authorization header
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${authToken}`
    }
  });

  // Pass the cloned request instead of the original request to the next handle
  return next(authReq);
};
