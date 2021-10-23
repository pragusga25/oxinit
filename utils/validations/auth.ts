import { z } from 'zod';

export const Login = z.object({
  email: z.string().email('Email tidak valid'),
  password: z
    .string()
    .min(8, 'Password harus memiliki minimal 8 karakter')
    .max(50, 'Password terlalu panjang')
    .regex(/\d/, 'Password harus mengandung minimal satu angka')
    .regex(/[a-z]/, 'Password harus mengandung minimal satu huruf kecil')
    .regex(/[A-Z]/, 'Password harus mengandung minimal satu huruf besar'),
});
