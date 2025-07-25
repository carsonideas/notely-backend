import { Request, Response, NextFunction } from 'express';
declare const authenticate: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export default authenticate;
//# sourceMappingURL=auth.d.ts.map