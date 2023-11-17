import { Alert, Text, AlertIcon, Flex, Icon } from '@chakra-ui/react';
import React, { useState } from 'react';
import { BiPoll } from "react-icons/bi";
import { BsLink45Deg, BsMic } from "react-icons/bs";
import { IoDocumentText, IoImageOutline } from "react-icons/io5";
import FormTabItem from './FormTabItem';
import TextInputs from './PostForm/TextInputs';
import ImageUpload from './PostForm/ImageUpload';
import { Post } from '@/src/atoms/postsAtom';
import { User } from 'firebase/auth';
import { useRouter } from 'next/router';
import { Timestamp, addDoc, collection, serverTimestamp, updateDoc } from 'firebase/firestore';
import { firestore, storage } from '@/src/firebase/clientApp';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import useSelectFile from '@/src/hooks/useSelectFile';

type NewPostFormProps = {
    user: User;
}

const formTabs: TabItem[] = [
    {
        title: "Post",
        icon: IoDocumentText,
    },
    {
        title: "Images & Video",
        icon: IoImageOutline,
    },
    {
        title: "Link",
        icon: BsLink45Deg,
    },
    {
        title: "Poll",
        icon: BiPoll,
    },
    {
        title: "Talk",
        icon: BsMic,
    },
];

export type TabItem = {
    title: string;
    icon: typeof Icon.arguments; // The as={} prop from Chakra UI's Icon component accepts a type of icon, this is what it is saying
}

const NewPostForm: React.FC<NewPostFormProps> = ({ user }) => {
    const router = useRouter();
    const [selectedTab, setSelectedTab] = useState(formTabs[0].title)
    const [textInputs, setTextInputs] = useState({
        title: "",
        body: "",
    });
    const { selectedFile, setSelectedFile, onSelectFile } = useSelectFile();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const handleCreatePost = async () => {
        const { communityId } = router.query
        // create new post object => type Post
        const newPost: Post = {
            communityId: communityId as string,
            creatorId: user.uid,
            creatorDisplayName: user.email!.split('@')[0],
            title: textInputs.title,
            body: textInputs.body,
            numberOfComments: 0,
            voteStatus: 0,
            createdAt: serverTimestamp() as Timestamp,
        };

        setLoading(true);
        try {
            // store the post in db
            const postDocRef = await addDoc(collection(firestore, "posts"), newPost);

            // check for selectedFile
            if (selectedFile) {

                // creates a posts folder in storage if not exists
                // else creates a reference to posts/postId/image in the bucket
                const imageRef = ref(storage, `posts/${postDocRef.id}/image`)

                // store in storage (a reference to the location you want to store, the file, the type)
                await uploadString(imageRef, selectedFile, `data_url`);

                // getDownloadURL(return imageURL) which makes it simpler for us to apply the image in another part of the website
                const downloadURL = await getDownloadURL(imageRef);

                // update post doc by adding imageURL
                await updateDoc(postDocRef, {
                    imageURL: downloadURL,
                })
            }

            // redirect the user back to the communityPage using the router
            router.back();
        } catch (error: any) {
            console.log("handleCreatePost error", error.message);
            setError(true);
        }

        setLoading(false);
    };

    const onTextChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { target: { name, value } } = event;
        setTextInputs((prev) => ({
            ...prev,
            // [] makes it so that instead of a key called "name", it makes a key called "title"
            // "Title" comes from the Input component
            [name]: value
        }));
    };

    return (
        <Flex direction="column" bg="White" borderRadius={4} mt={2}>
            <Flex width="100%">
                {formTabs.map((item) => (
                    // Assigns a unique key value to each instance of FormTabItem to prevent console error
                    <FormTabItem key={item.title} item={item} selected={item.title === selectedTab} setSelectedTab={setSelectedTab} />
                ))}
            </Flex>
            <Flex p={4}>
                {selectedTab === "Post" && (<TextInputs
                    textInputs={textInputs}
                    handleCreatePost={handleCreatePost}
                    onChange={onTextChange}
                    loading={loading}
                />)}
                {selectedTab === "Images & Video" && (<ImageUpload
                    selectedFile={selectedFile}
                    onSelectImage={onSelectFile}
                    setSelectedTab={setSelectedTab}
                    setSelectedFile={setSelectedFile}
                />)}
            </Flex>
            {error && (
                <Alert status='error'>
                    <AlertIcon />
                    <Text mr={2}>Error creating post</Text>
                </Alert>
            )}
        </Flex>
    )
}
export default NewPostForm;