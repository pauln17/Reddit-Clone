import PageContent from '@/src/components/Layout/PageContent';
import PostItem from '@/src/components/Posts/PostItem';
import { auth } from '@/src/firebase/clientApp';
import usePosts from '@/src/hooks/usePosts';
import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';


const PostPage: React.FC = () => {
    const [user] = useAuthState(auth);
    const { postStateValue, setPostStateValue, onDeletePost, onVote } = usePosts();
    return (
        <PageContent>
            <>
                {postStateValue.selectedPost && (
                    <PostItem
                        post={postStateValue.selectedPost}
                        onVote={onVote}
                        onDeletePost={onDeletePost}
                        userVoteValue={postStateValue.postVotes.find(
                            item => item.postId === postStateValue.selectedPost?.id)
                            ?.voteValue
                        }
                        userIsCreator={user?.uid === postStateValue.selectedPost?.creatorId}
                    />
                )}
            </>
            <>
                {/* <About> */}
            </>
        </PageContent>
    )
}
export default PostPage;