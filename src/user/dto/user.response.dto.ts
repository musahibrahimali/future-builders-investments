export class UserResponseDto{
    userId: string;
    username: string;
    password?: string;
    email?: string;
    refferalCode?: string;
    image?: string;
    balance?: string;
    referrals?: string;
    deposits?: string;
    withdrawals?: string;
    passwordResetKey?: string;
    salt?: string;
    createdAt: Date;
    updatedAt: Date;
}