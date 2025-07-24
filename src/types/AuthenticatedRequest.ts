
import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  // profileImage: string | null;
}

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export default AuthenticatedRequest;
