import { authModalState } from '@/src/atoms/authModalAtom';
import {
    Flex,
    Text,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay
} from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import AuthInputs from './AuthInputs';
import OAuthButtons from './OAuthButtons';
import { auth } from '@/src/firebase/clientApp';
import { useAuthState } from 'react-firebase-hooks/auth';
import ResetPassword from './ResetPassword';

const AuthModal: React.FC = () => {
    const [modalState, setModalState] = useRecoilState(authModalState);
    const [user, loading, error] = useAuthState(auth);

    const handleClose = () => {
        setModalState((prev) => ({
            ...prev,
            open: false, // ...prev spreads the previous modalState but the function only updates open
        }))
    }

    useEffect(() => {
        if (user) handleClose();
    }, [user])

    return (
        <>
            <Modal isOpen={modalState.open} onClose={handleClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader textAlign="center">
                        {modalState.view === 'login' && 'Login'}
                        {modalState.view === 'signup' && 'Sign Up'}
                        {modalState.view === 'resetPassword' && 'Reset Password'}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center">
                        <Flex
                            direction="column"
                            align="center"
                            justify="center"
                            width="70%"
                            pb={6}
                        >
                            {modalState.view === 'login' || modalState.view === 'signup' ? (
                                <>
                                    <OAuthButtons />
                                    <Text color="gray.500" fontWeight={700}>OR</Text>
                                    <AuthInputs />
                                </>
                            ) : (
                                <ResetPassword />
                            )}
                        </Flex>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    )
}
export default AuthModal;