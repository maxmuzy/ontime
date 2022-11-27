import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { FiPower } from '@react-icons/all-files/fi/FiPower';

import { LoggingContext } from '../../context/LoggingContext';
import { Size } from '../../models/UtilTypes';

interface QuitIconBtnProps {
  clickHandler: () => void;
  size?: Size;
}

const quitBtnStyle = {
  color: '#D20300', // $red-700
  borderColor: '#D20300', // $red-700
  _focus: { boxShadow: 'none' },
  _hover: {
    background: '#D20300', // $red-700
    color: 'white',
  },
  _active: {
    background: '#9A0000', // $red-1000
    color: 'white',
  },
  variant: 'outline',
  isRound: true,
};

export default function QuitIconBtn(props: QuitIconBtnProps) {
  const { clickHandler, size = 'lg', ...rest } = props;
  const [isOpen, setIsOpen] = useState(false);
  const { emitInfo } = useContext(LoggingContext);
  const onClose = () => setIsOpen(false);
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (window.process?.type === 'renderer') {
      window.ipcRenderer.on('user-request-shutdown', () => {
        emitInfo('Shutdown request');
        setIsOpen(true);
      });
    }
  }, [emitInfo]);

  const handleShutdown = useCallback(() => {
    onClose();
    clickHandler();
  }, [clickHandler]);

  return (
    <>
      <Tooltip label='Quit Application'>
        <IconButton
          aria-label='Quit Application'
          size={size}
          icon={<FiPower />}
          onClick={() => setIsOpen(true)}
          {...quitBtnStyle}
          {...rest}
        />
      </Tooltip>
      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Ontime Shutdown
            </AlertDialogHeader>
            <AlertDialogBody>
              This will shutdown the program and all running servers. Are you sure?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} variant='ghost'>
                Cancel
              </Button>
              <Button colorScheme='red' onClick={handleShutdown} ml={3}>
                Shutdown
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
