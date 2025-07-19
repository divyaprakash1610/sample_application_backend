import { UseGuards, Controller, Get, Req, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('user')
export class UsersController {
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: any) {
    console.log('✅ Inside /user/profile route');
    return {
      message: 'Protected route',
      user: req.user, // contains userId and email from JWT
    };
  }
}
