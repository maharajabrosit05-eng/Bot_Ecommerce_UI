import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Attaches the JWT + OID/EID headers to every outgoing request.
 * Backend requires OID (and EID, unless Login_Type is 'Device') headers
 * to match the encrypted claims inside the token — see
 * JwtService.GetJwtClaimIsValid() in the API's Program.cs.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = sessionStorage.getItem('token');
  const oid = sessionStorage.getItem('oid');
  const eid = sessionStorage.getItem('eid');

  if (!token) {
    return next(req);
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`
  };
  if (oid) { headers['OID'] = oid; }
  if (eid) { headers['EID'] = eid; }

  const authReq = req.clone({ setHeaders: headers });
  return next(authReq);
};