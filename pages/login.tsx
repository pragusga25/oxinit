import { useAuth } from '../firebase/AuthProvider';
import React from 'react';
import { Box, Button } from '@chakra-ui/react';
import { Input } from '@atoms/Input';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Login } from '@utils/validations/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { errorToast, successToast } from '@utils/toast';

function SignInScreen() {
  const auth = useAuth();
  const ctx = useForm<z.infer<typeof Login>>({
    defaultValues: {
      email: 'youremail@ex.com',
      password: 'Abcde123',
    },
    resolver: zodResolver(Login),
    mode: 'onBlur',
  });

  const {
    getValues,
    trigger,
    formState: { isSubmitting },
  } = ctx;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (await trigger())
      auth
        .loginWithEmailAndPassword(getValues().email, getValues().password)
        .then(() => {
          successToast('Berhasil login');
        })
        .catch((err) => {
          errorToast(err.message);
        });
  };

  return (
    <Box>
      <FormProvider {...ctx}>
        <form onSubmit={onSubmit}>
          <Input type="email" placeholder="Email" name="email" />
          <Input type="password" placeholder="Password" name="password" />
          <Button type="submit" disabled={isSubmitting}>
            Login
          </Button>
        </form>
        <Button
          onClick={async () => {
            await auth.loginWithGoogle();
          }}
        >
          Login with Google
        </Button>
      </FormProvider>
    </Box>
  );
}

export default SignInScreen;
