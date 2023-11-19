import React, { useEffect } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { Post, PostVote, postState } from '../atoms/postsAtom';
import { deleteObject, ref } from 'firebase/storage';
import { auth, firestore, storage } from '../firebase/clientApp';
import { collection, deleteDoc, doc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { communityState } from '../atoms/communitiesAtom';
import { authModalState } from '../atoms/authModalAtom';

const usePosts = () => {
    const [user] = useAuthState(auth);
    const [postStateValue, setPostStateValue] = useRecoilState(postState);
    const currentCommunity = useRecoilValue(communityState).currentCommunity;
    const setAuthModalState = useSetRecoilState(authModalState);

    const onVote = async (post: Post, vote: number, communityId: string) => {
        // check for a user => if not, open auth modal
        if (!user?.uid) {
            setAuthModalState({ open: true, view: "login" })
            return;
        }
        
        try {
            const { voteStatus } = post;
            // Returns a vote object if the user has voted on the post before, else undefined
            const existingVote = postStateValue.postVotes.find(
                (vote) => vote.postId === post.id
            );

            const batch = writeBatch(firestore)
            const updatedPost = { ...post }; // A copy of the post
            const updatedPosts = [...postStateValue.posts]; // A copy of an array of posts in a community
            let updatedPostVotes = [...postStateValue.postVotes]; // A copy of the postVotes subcollection
            let voteChange = vote;

            if (!existingVote) {
                // create/update a new postVote subcollection/document
                const postVoteRef = doc(
                    collection(firestore, 'users', `${user?.uid}/postVotes`)
                );

                const newVote: PostVote = {
                    id: postVoteRef.id,
                    postId: post.id!,
                    communityId,
                    voteValue: vote,
                }

                batch.set(postVoteRef, newVote);

                // add/subtract 1 to/from post.voteStatus
                updatedPost.voteStatus = voteStatus + vote;

                // update temporary state array of postVotes with the new vote
                updatedPostVotes = [...updatedPostVotes, newVote]
            }
            // existing vote - they have voted on the post before
            else {
                const postVoteRef = doc(firestore, "users", `${user?.uid}/postVotes/${existingVote.id}`)
                // removing their vote ( up => neutral OR down => neutral)
                if (existingVote.voteValue === vote) {
                    // add/subtract 1 to/from post.voteStatus
                    updatedPost.voteStatus = voteStatus - vote;
                    updatedPostVotes = updatedPostVotes.filter(
                        (vote) => vote.id !== existingVote.id
                    );
                    // delete the postVote document
                    batch.delete(postVoteRef);
                    voteChange *= -1;
                }
                // flipping their vote * up => down OR down => up
                else {
                    // add/subtract 2 to/from post.voteStatus
                    updatedPost.voteStatus = voteStatus + 2 * vote

                    const voteIdx = postStateValue.postVotes.findIndex(
                        (vote) => vote.id === existingVote.id
                    );

                    updatedPostVotes[voteIdx] = {
                        ...existingVote,
                        voteValue: vote,
                    }

                    // updating the existing postVote document
                    batch.update(postVoteRef, {
                        voteValue: vote,
                    })

                    voteChange = 2 * vote;
                }
            }
            // update our post document
            const postRef = doc(firestore, "posts", post.id!);
            batch.update(postRef, { voteStatus: voteStatus + voteChange })

            await batch.commit();

            // update state with updated values
            const postIdx = postStateValue.posts.findIndex(
                (item) => item.id === post.id
            );
            updatedPosts[postIdx] = updatedPost;

            setPostStateValue((prev) => ({
                ...prev,
                posts: updatedPosts,
                postVotes: updatedPostVotes,
            }));

        } catch (error) {
            console.log("onVote error", error);
        }
    };

    const onSelectPost = () => { };

    const onDeletePost = async (post: Post): Promise<boolean> => {
        try {
            // check if image, delete from storage if exists
            if (post.imageURL) {
                const imageRef = ref(storage, `posts/${post.id}/image`);
                await deleteObject(imageRef);
            }

            // delete post document from firestore
            const postDocRef = doc(firestore, 'posts', post.id!);
            await deleteDoc(postDocRef);

            // update recoil atom state
            setPostStateValue((prev) => ({
                ...prev,
                posts: prev.posts.filter((item) => item.id !== post.id)
            }));
            return true;
        } catch (error) {
            return false;
        }
    };

    // retrieve the user's postVote subcollection
    const getCommunityPostVotes = async (communityId: string) => {
        const postVotesQuery = query(
            collection(firestore, 'users', `${user?.uid}/postVotes`),
            where('communityId', '==', communityId)
        );

        const postVoteDocs = await getDocs(postVotesQuery);
        const postVotes = postVoteDocs.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        setPostStateValue((prev) => ({
            ...prev,
            postVotes: postVotes as PostVote[]
        }));
    }

    useEffect(() => {
        if (!user || !currentCommunity?.id) return;
        getCommunityPostVotes(currentCommunity?.id)
    }, [user, currentCommunity])

    useEffect(() => {
        if (!user) {
            setPostStateValue((prev) => ({
                ...prev,
                postVotes: [],
            }))
        }
    }, [user])

    return {
        postStateValue,
        setPostStateValue,
        onVote,
        onSelectPost,
        onDeletePost,
    }
}
export default usePosts;
