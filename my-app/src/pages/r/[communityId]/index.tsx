import { doc, getDoc } from 'firebase/firestore';
import { firestore } from "../../../firebase/clientApp"
import { GetServerSidePropsContext } from 'next';
import React, { useEffect } from 'react';
import { Community, communityState } from '@/src/atoms/communitiesAtom';
import safeJsonStringify from 'safe-json-stringify';
import NotFound from "@/src/components/Community/NotFound"
import Header from '@/src/components/Community/Header';
import PageContent from '@/src/components/Layout/PageContent';
import CreatePostLink from "@/src/components/Community/CreatePostLink";
import Posts from '@/src/components/Posts/Posts';
import { useSetRecoilState } from 'recoil';
import About from '@/src/components/Community/About';

type CommunityPageProps = {
    communityData: Community;
};

const CommunityPage: React.FC<CommunityPageProps> = ({ communityData }) => {
    const setCommunityStateValue = useSetRecoilState(communityState);
    
    useEffect(() => {
        setCommunityStateValue((prev) => ({
            ...prev,
            currentCommunity: communityData,
        }))
    }, [communityData])

    if (!communityData) {
        return (
            <NotFound />
        )
    }

    return (
        <>
            <Header communityData={communityData} />

            {/* 
            PageContent is a LAYOUT Component that takes two childrens, 
            in this scenario the two react fragment and formats them 
            */}
            <PageContent>
                <>
                    <CreatePostLink />
                    <Posts communityData={communityData} />
                </>
                <>
                    <>
                        <About communityData={communityData} />
                    </>
                </>
            </PageContent>
        </>
    )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    // Get Community Data to Display on Client
    try {
        const communityRef = doc(
            firestore,
            'communities',
            context.query.communityId as string // GetServerSidePropsContext has multiple properties, one of which being .query that allows us to access the query parameters in the dynamic routing URL [communityId]
        );
        const communityDoc = await getDoc(communityRef);

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

export default CommunityPage;