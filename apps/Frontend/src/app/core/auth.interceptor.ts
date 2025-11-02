import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // TODO: Replace with your actual token
  const authToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJrYW1pbC5wYXJ0eWthQGdtYWlsLmNvbSIsImlhdCI6MTc2MjA4NjYxMywiZXhwIjoxNzYyMDkwMjEzfQ.bgwLKaoPntoCKwW5V_7HQNl9TurNf6s-XXrbasicAb4';

  // Clone the request and add the authorization header
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${authToken}`
    }
  });

  // Pass the cloned request instead of the original request to the next handle
  return next(authReq);
};
