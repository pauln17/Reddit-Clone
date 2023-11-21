import { Community, communityState } from '@/src/atoms/communitiesAtom';
import About from '@/src/components/Community/About';
import PageContent from '@/src/components/Layout/PageContent';
import NewPostForm from '@/src/components/Posts/NewPostForm';
import { auth, firestore } from '@/src/firebase/clientApp';
import useCommunityData from '@/src/hooks/useCommunityData';
import { Box, Text } from '@chakra-ui/react';
import { doc, getDoc } from 'firebase/firestore';
import { GetServerSidePropsContext } from 'next';
import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRecoilValue } from 'recoil';
import safeJsonStringify from 'safe-json-stringify';


const SubmitPostPage: React.FC = () => {
    const [user] = useAuthState(auth);
    const { communityStateValue } = useCommunityData();

    return (
        <PageContent>
            <>
                <Box p="14px 0px" borderBottom="1px solid" borderColor="white">
                    <Text>Create a post</Text>
                </Box>
                {user && <NewPostForm user={user} communityImageURL={communityStateValue.currentCommunity?.imageURL} />}
            </>
            <>
                {communityStateValue.currentCommunity && (
                    <About
                        communityData={communityStateValue.currentCommunity}
                        pt={"62px"}
                    />
                )}
            </>
        </PageContent>
    )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    // Get Community Data to Display on Client
    try {
        const communityDocRef = doc(
            firestore,
            'communities',
            context.query.communityId as string // GetServerSidePropsContext has multiple properties, one of which being .query that allows us to access the query parameters in the dynamic routing URL [communityId]
        );
        const communityDoc = await getDoc(communityDocRef);

        return {
            props: {
                communityData: communityDoc.exists() ? JSON.parse( // Sets the prop: communityData to be a string that was converted into a JSON object which is then passed to the component above this function
                    safeJsonStringify({
                        id: communityDoc.id,
                        ...communityDoc.data()
                    }
                    )
                ) : ""
            }
        }
    } catch (error) {
        console.log('getServerSideProps error', error)
    }
}

export default SubmitPostPage;