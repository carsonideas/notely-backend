import { Response } from 'express';
import AuthenticatedRequest from '../types/AuthenticatedRequest';
declare const _default: {
    getProfile: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updateProfile: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    uploadAvatar: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updatePassword: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getUserNotes: (req: AuthenticatedRequest, res: Response) => Promise<void>;
};
export default _default;
//# sourceMappingURL=user.controller.d.ts.map