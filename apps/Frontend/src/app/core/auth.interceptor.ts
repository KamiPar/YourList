import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // TODO: Replace with your actual token
  const authToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJrYW1pbC5wYXJ0eWthQGdtYWlsLmNvbSIsImlhdCI6MTc2MjA5NzgyOCwiZXhwIjoxNzYyMTAxNDI4fQ.fb3ZuaopoG-qyx2iY-tzXMCTZn_gK8CjxW0AQERFbIU';

  // Clone the request and add the authorization header
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${authToken}`
    }
  });

  // Pass the cloned request instead of the original request to the next handle
  return next(authReq);
};
