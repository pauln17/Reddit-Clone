import { collection, doc, getDocs, increment, writeBatch } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { authModalState } from '../atoms/authModalAtom';
import { Community, CommunitySnippet, communityState } from '../atoms/communitiesAtom';
import { auth, firestore } from '../firebase/clientApp';


const useCommunityData = () => {
    const [user] = useAuthState(auth);
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
                // It is good practice to still spread the previous state of communityStateValue even if there is only one property
                // In this case, mySnippets which is an array of type CommunitySnippet[]
                // Basically this is saying it will only update the properties listed below out of the previous properties
                mySnippets: snippets as CommunitySnippet[],
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
                mySnippets: [...prev.mySnippets, newSnippet],
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
                mySnippets: prev.mySnippets.filter(
                    (item) => item.communityId !== communityId
                ),
            }));
            setLoading(false);
        } catch (error: any) {
            console.log("leaveCommunity error", error);
            setError(error.message);
        }
        setLoading(false)
    };

    useEffect(() => {
        if (!user) return;
        getMySnippets();
    }, [user])

    return {
        // data and functions
        communityStateValue,
        onJoinOrLeaveCommunity,
        loading,
    }
}
export default useCommunityData;