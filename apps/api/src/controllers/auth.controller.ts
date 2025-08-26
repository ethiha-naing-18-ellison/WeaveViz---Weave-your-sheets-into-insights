import { Request, Response } from 'express';
import { AuthService } from '@/services/auth.service';
import { UserLoginSchema, UserRegisterSchema } from '@/utils/zodSchemas';

export class AuthController {
  static async register(req: Request, res: Response) {
    const { email, password } = UserRegisterSchema.parse(req.body);

    const result = await AuthService.register(email, password);

    res.status(201).json(result);
  }

  static async login(req: Request, res: Response) {
    const { email, password } = UserLoginSchema.parse(req.body);

    const result = await AuthService.login(email, password);

    res.json(result);
  }

  static async getProfile(req: Request & { user?: any }, res: Response) {
    const user = await AuthService.getUserById(req.user!.id);
    
    if (!user) {
      return res.status(404).json({
        errorCode: 'NOT_FOUND',
        message: 'User not found'
      });
    }

    res.json({ user });
  }
}
