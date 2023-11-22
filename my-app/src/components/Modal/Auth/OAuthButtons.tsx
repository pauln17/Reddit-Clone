import { Flex, Button, Image, Text } from '@chakra-ui/react';
import React from 'react';
import { useSignInWithGoogle, useSignInWithGithub } from 'react-firebase-hooks/auth';
import { auth } from '@/src/firebase/clientApp';

const OAuthButton: React.FC = () => {
    const [signInWithGoogle, userGoogle, loadingGoogle, errorGoogle] = useSignInWithGoogle(auth);
    const [signInWithGithub, userGithub, loadingGithub, errorGithub] = useSignInWithGithub(auth);

    return (
        <>
            <Flex direction="column" width="100%" mb={4}>
                <Button
                    variant="oauth"
                    mb={2}
                    isLoading={loadingGoogle}
                    onClick={() => signInWithGoogle()}
                >
                    <Image alt="Google" src="/images/googlelogo.png" height="20px" mr={4} />
                    Continue with Google
                </Button>
                <Button
                    variant="oauth"
                    mb={2}
                    isLoading={loadingGithub}
                    onClick={() => signInWithGithub()}
                >
                    <Image alt="Github" src="/images/githublogo.png" height="20px" mr={2} />
                    Continue with Github
                </Button>
                {(errorGoogle || errorGithub) && <Text>
                    {errorGoogle && errorGoogle.message}
                    {errorGithub && errorGithub.message}
                </Text>
                }
            </Flex>
        </>
    )
}
export default OAuthButton;