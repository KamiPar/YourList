import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // TODO: Replace with your actual token
  const authToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJrYW1pbC5wYXJ0eWthMTk5OEBnbWFpbC5jb20iLCJpYXQiOjE3NjE3MTkzMTIsImV4cCI6MTc2MTcyMjkxMn0._punQJqMU6Et9wWzmFfBd7jOuxToxWjFdzzhwUklZho';

  // Clone the request and add the authorization header
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${authToken}`
    }
  });

  // Pass the cloned request instead of the original request to the next handle
  return next(authReq);
};
