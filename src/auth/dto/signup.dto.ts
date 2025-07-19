import {
    IsEmail,
    Matches,
    MinLength,
} from 'class-validator';

export class SignupDto {
  @IsEmail({}, { message: 'Invalid email format' })
   email: string;

  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
  message: 'Password must contain uppercase, lowercase, number, and special character',
})

  password: string;
}
