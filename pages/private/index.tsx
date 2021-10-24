import { Box } from '@chakra-ui/layout';
import { useAuth } from '../../firebase/AuthProvider';
import { NextPage } from 'next';
import { Button } from '@chakra-ui/button';

const PrivatePage: NextPage = () => {
  const auth = useAuth();
  return (
    <Box>
      This is a private page
      <Button
        onClick={async () => {
          await auth.logout();
        }}
      >
        Logout
      </Button>
    </Box>
  );
};

export default PrivatePage;
