
import { Inter } from 'next/font/google'
import useCommunityData from '../hooks/useCommunityData'
import PageContent from '../components/Layout/PageContent';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from '../firebase/clientApp';
import { log } from 'console';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import usePosts from '../hooks/usePosts';
import { Post } from '../atoms/postsAtom';
import PostLoader from '../components/Posts/PostLoader';
import { Stack } from '@chakra-ui/react';
import PostItem from '../components/Posts/PostItem';
import CreatePostLink from '../components/Community/CreatePostLink';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const { communityStateValue } = useCommunityData();
  const [user, loadingUser] = useAuthState(auth)
  const [loading, setLoading] = useState(false);
  const {
    postStateValue,
    setPostStateValue,
    onSelectPost,
    onDeletePost,
    onVote
  } = usePosts();

  const buildUserHomeFeed = async () => {
    setLoading(true);
    try {
      if (communityStateValue.mySnippets.length) {
        // get posts from users' communities
        const myCommunityIds = communityStateValue.mySnippets.map(
          (snippet) => snippet.communityId
        );

        const postQuery = query(
          collection(firestore, "posts"),
          where("communityId", "in", myCommunityIds),
          limit(10)
        )

        const postDocs = await getDocs(postQuery);
        const posts = postDocs.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        setPostStateValue((prev) => {
          return ({
            ...prev,
            posts: posts as Post[]
          });
        });
      } else {
        buildNoUserHomeFeed();
      }
    } catch (error) {
      console.log("buildUserHomeFeed error", error);
    }
    setLoading(false);
  }

  const buildNoUserHomeFeed = async () => {
    setLoading(true)
    try {
      const postQuery = query(
        collection(firestore, "posts"),
        orderBy("voteStatus", "desc"),
        limit(10)
      );

      const postDocs = await getDocs(postQuery);
      const posts = postDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      setPostStateValue((prev) => {
        return ({
          ...prev,
          posts: posts as Post[]
        });
      });
    } catch (error) {
      console.log("buildNoUserHomeFeed error", error);
    }
    setLoading(false);
  };

  const getUserPostVotes = () => {

  };

  // The reason for loadingUser is that user initially returns as undefined, so we check if the system has attempted to fetch it or not
  useEffect(() => {
    if (!user && !loadingUser) buildNoUserHomeFeed()

  }, [user, loadingUser])

  useEffect(() => {
    if (communityStateValue.snippetsFetched) buildUserHomeFeed()

  }, [communityStateValue.snippetsFetched])

  return (
    <PageContent>
      <>
        <CreatePostLink />
        {loading ? (
          <PostLoader />
        ) : (
          <Stack>
            {postStateValue.posts.map((post) => (
              <PostItem
                key={post.id}
                post={post}
                onSelectPost={onSelectPost}
                onDeletePost={onDeletePost}
                onVote={onVote}
                userVoteValue={postStateValue.postVotes.find(
                  (item) => item.postId === post.id
                )?.voteValue}
                userIsCreator={user?.uid === post.creatorId}
                homePage
              />
            ))}
          </Stack>
        )}
      </>
      <>
        {/* Recommendations */}
      </>
    </PageContent>
  )
}

