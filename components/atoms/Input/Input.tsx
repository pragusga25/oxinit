import { Input as InputCh, Box, InputProps, Text } from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';
import { FC } from 'react';

export const Input: FC<InputProps & { showError?: boolean }> = ({
  name = '',
  showError = false,
  ...props
}) => {
  const {
    register,
    formState: { isSubmitting, errors },
  } = useFormContext();

  const error = Array.isArray(errors[name])
    ? errors[name].join(', ')
    : errors[name]?.message || errors[name];

  return (
    <Box>
      <InputCh disabled={isSubmitting} {...register(name)} {...props} />
      {error && showError && <Text>{error}</Text>}
    </Box>
  );
};
