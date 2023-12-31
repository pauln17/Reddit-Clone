import { collection, doc, getDoc, getDocs, increment, writeBatch } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRecoilCallback, useRecoilState, useSetRecoilState } from 'recoil';
import { authModalState } from '../atoms/authModalAtom';
import { Community, CommunitySnippet, communityState, defaultCommunity } from '../atoms/communitiesAtom';
import { auth, firestore } from '../firebase/clientApp';
import { useRouter } from 'next/router';


const useCommunityData = () => {
    const [user] = useAuthState(auth);
    const router = useRouter();
    const [communityStateValue, setCommunityStateValue] = useRecoilState(communityState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const setAuthModalState = useSetRecoilState(authModalState);

    const onJoinOrLeaveCommunity = (communityData: Community, isJoined: boolean) => {
        // is the user signed in?
        // if not => open auth modal
        if (!user) {
            // open modal
            setAuthModalState({ open: true, view: 'login' });
            return;
        }

        if (isJoined) {
            leaveCommunity(communityData.id);
            return;
        }
        joinCommunity(communityData)
    }

    const getMySnippets = async () => {
        setLoading(true);
        try {
            const snippetDocs = await getDocs(
                collection(firestore, `users/${user?.uid}/communitySnippets`)
            );

            const snippets = snippetDocs.docs.map((doc) => ({ ...doc.data() }));

            setCommunityStateValue((prev) => ({
                ...prev,
                mySnippets: snippets as CommunitySnippet[],
                snippetsFetched: true
            }));
        } catch (error: any) {
            console.log('getMySnippets error', error)
        }
        setLoading(false);
    }

    const joinCommunity = async (communityData: Community) => {
        // batch write
        setLoading(true);
        try {
            const batch = writeBatch(firestore);
            // creating a new community snippet
            const newSnippet: CommunitySnippet = {
                communityId: communityData.id,
                imageURL: communityData.imageURL || "",
                isModerator: user?.uid === communityData.creatorId,
            }

            batch.set(
                doc(
                    firestore,
                    `users/${user?.uid}/communitySnippets`,
                    communityData.id
                ),
                newSnippet
            )

            // updating the numberOfMembers by +1
            batch.update(doc(firestore, 'communities', communityData.id), {
                numberOfMembers: increment(1),
            });

            await batch.commit();

            // update recoil state -- communityState.mySnippets
            setCommunityStateValue(prev => ({
                ...prev,
                mySnippets: [...prev.mySnippets, newSnippet],
                currentCommunity: {
                    ...prev.currentCommunity,
                    numberOfMembers: prev.currentCommunity?.numberOfMembers! + 1
                } as Community
            }));
            setLoading(false);
        } catch (error: any) {
            console.log("joinCommunity error", error);
            setError(error.message);
        }
        setLoading(false)
    };

    const leaveCommunity = async (communityId: string) => {
        // batch write
        setLoading(true);
        try {
            const batch = writeBatch(firestore);

            // deleting the community snippet from user
            batch.delete(doc(firestore, `users/${user?.uid}/communitySnippets`, communityId))

            // updating the numberOfMembers by -1
            batch.update(doc(firestore, 'communities', communityId), {
                numberOfMembers: increment(-1),
            });

            await batch.commit();

            setCommunityStateValue(prev => ({
                ...prev,
                mySnippets: prev.mySnippets.filter(
                    (item) => item.communityId !== communityId
                ),
                currentCommunity: {
                    ...prev.currentCommunity,
                    numberOfMembers: prev.currentCommunity?.numberOfMembers! - 1
                } as Community
            }));
            setLoading(false);
        } catch (error: any) {
            console.log("leaveCommunity error", error);
            setError(error.message);
        }
        setLoading(false)
    };

    const getCommunityData = async (communityId: string) => {
        try {
            const communityRef = doc(firestore, "communities", communityId);
            const communityDoc = await getDoc(communityRef);

            setCommunityStateValue((prev) => ({
                ...prev,
                currentCommunity: { id: communityDoc.id, ...communityDoc.data() } as Community
            }));
        } catch (error) {
            console.log("getCommunityData error", error);
        }
    }

    useEffect(() => {
        if (!user) {
            setCommunityStateValue((prev) => ({
                ...prev,
                mySnippets: [],
                snippetsFetched: false,
            }))
            return;
        }
        getMySnippets();
    }, [user])

    useEffect(() => {
        const { communityId } = router.query;
        if (communityId) {
            const communityData = communityStateValue.currentCommunity;

            if (!communityData.id) {
                getCommunityData(communityId as string);
                return;
            }
        } else {
            setCommunityStateValue((prev) => ({
                ...prev,
                currentCommunity: defaultCommunity,
            }));
        }
    }, [router.query, communityStateValue.currentCommunity]);

    return {
        // data and functions
        getMySnippets,
        communityStateValue,
        setCommunityStateValue,
        onJoinOrLeaveCommunity,
        loading,
        getCommunityData,
    }
}
export default useCommunityData;