import { Post, postState } from '@/src/atoms/postsAtom';
import { Box, Flex, SkeletonCircle, SkeletonText, Stack, Text } from '@chakra-ui/react';
import { User } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import CommentInput from './CommentInput';
import { Timestamp, collection, doc, increment, query, orderBy, serverTimestamp, where, writeBatch, getDocs } from 'firebase/firestore';
import { firestore } from '@/src/firebase/clientApp';
import { useSetRecoilState } from 'recoil';
import CommentItem, { Comment } from './CommentItem';

type CommentsProps = {
    user: User;
    selectedPost: Post | null;
    communityId: string;
};

const Comments: React.FC<CommentsProps> = ({
    user,
    selectedPost,
    communityId,
}) => {
    const [commentText, setCommentText] = useState("")
    const [comments, setComments] = useState<Comment[]>([])
    const [fetchLoading, setFetchLoading] = useState(true)
    const [createLoading, setCreateLoading] = useState(false)
    const [loadingDeleteId, setLoadingDeleteId] = useState('');
    const setPostState = useSetRecoilState(postState);

    const onCreateComment = async (commentText: string) => {
        setCreateLoading(true);
        try {
            const batch = writeBatch(firestore);

            // create a comment document
            const commentRef = doc(collection(firestore, "comments"))

            const newComment: Comment = {
                id: commentRef.id,
                creatorId: user.uid,
                creatorDisplayText: user.email!.split("@")[0],
                communityId,
                postId: selectedPost?.id!,
                postTitle: selectedPost?.title!,
                text: commentText,
                createdAt: serverTimestamp() as Timestamp,
            }

            batch.set(commentRef, newComment);

            // create our own timestamp, this was not needed when creating posts
            // this is because in posts, we created a doc in the database then fetched the posts
            // and then insert it into the global state, here we are directly inserting it which is not allowed
            newComment.createdAt = { seconds: Date.now() / 1000 } as Timestamp

            // update post numberOfComments
            const postRef = doc(firestore, "posts", selectedPost?.id!)
            batch.update(postRef, {
                numberOfComments: increment(1)
            });

            await batch.commit();

            // update client recoil state
            setCommentText("")
            setComments(prev => [newComment, ...prev])
            setPostState((prev) => ({
                ...prev,
                selectedPost: {
                    ...prev.selectedPost,
                    numberOfComments: prev.selectedPost?.numberOfComments! + 1
                } as Post
            }));
        } catch (error) {
            console.log("onCreateComment error", error)
        }
        setCreateLoading(false);
    }

    const onDeleteComment = async (comment: Comment) => {
        setLoadingDeleteId(comment.id as string);
        try {
            if (!comment.id) throw "Comment has no ID";
            const batch = writeBatch(firestore);
            // delete the comment document
            const commentRef = doc(firestore, "comments", comment.id);
            batch.delete(commentRef);

            // update post numberOfComments - 1
            const postRef = doc(firestore, 'posts', selectedPost?.id!);
            batch.update(postRef, {
                numberOfComments: increment(-1),
            })

            await batch.commit();

            // update client recoil state
            setPostState((prev) => ({
                ...prev,
                selectedPost: {
                    ...prev.selectedPost,
                    numberOfComments: prev.selectedPost?.numberOfComments! - 1
                } as Post
            }))

            setComments(prev => prev.filter(item => item.id !== comment.id));
        } catch (error) {
            console.log("onDeleteComment error", error)
        }
        setLoadingDeleteId('');
    }

    const getPostComments = async () => {
        try {
            const commentsQuery = query(
                collection(firestore, "comments"),
                where("postId", "==", selectedPost?.id),
                orderBy("createdAt", "desc")
            );
            const commentDocs = await getDocs(commentsQuery);
            const comments = commentDocs.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }))
            setComments(comments as Comment[]);
        } catch (error) {
            console.log("getPostComments error", error)
        }
        setFetchLoading(false);
    }

    useEffect(() => {
        if (!selectedPost) return;
        getPostComments();
    }, [selectedPost])


    return (
        <Box bg="white" borderRadius="0px 0px 4px 4px" p={2}>
            <Flex
                direction="column"
                pl={10}
                pr={4}
                mb={6}
                fontSize="10pt"
                width="100%">
                {!fetchLoading && (
                    <CommentInput
                        commentText={commentText}
                        setCommentText={setCommentText}
                        user={user}
                        createLoading={createLoading}
                        onCreateComment={onCreateComment}
                    />
                )}
            </Flex>
            <Stack spacing={6} p={2}>
                {fetchLoading ? (
                    <>
                        {[0, 1, 2].map((item) => (
                            <Box key={item} padding="6" bg="white">
                                <SkeletonCircle size="10" />
                                <SkeletonText mt="4" noOfLines={2} spacing="4" />
                            </Box>
                        ))}
                    </>
                ) : (
                    <>
                        {comments.length === 0 ? (
                            <>
                                <Flex
                                    direction="column"
                                    justify="center"
                                    align="center"
                                    borderTop="1px solid"
                                    borderColor="gray.100"
                                    p={20}
                                >
                                    <Text fontWeight={700} opacity={0.35}>
                                        No Comments Yet
                                    </Text>
                                </Flex>

                            </>
                        ) : (
                            <>
                                {
                                    comments.map((comment) => (
                                        <CommentItem
                                            key={comment.id}
                                            comment={comment}
                                            onDeleteComment={onDeleteComment}
                                            loadingDelete={loadingDeleteId === comment.id}
                                            userId={user.uid}
                                        />
                                    ))
                                }
                            </>
                        )}
                    </>
                )}
            </Stack>
        </Box>
    )
}
export default Comments;