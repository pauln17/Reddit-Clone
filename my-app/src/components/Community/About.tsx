import { Community, communityState } from '@/src/atoms/communitiesAtom';
import { auth, firestore, storage } from '@/src/firebase/clientApp';
import useSelectFile from '@/src/hooks/useSelectFile';
import { Box, Button, Divider, Flex, Icon, Image, Spinner, Stack, Text } from '@chakra-ui/react';
import { deleteField, doc, updateDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadString } from 'firebase/storage';
import moment from "moment";
import Link from "next/link";
import React, { useRef, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { FaReddit } from 'react-icons/fa';
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { RiCakeLine } from "react-icons/ri";
import { useRecoilState } from 'recoil';

type AboutProps = {
    communityData: Community;
};

const About: React.FC<AboutProps> = ({ communityData }) => {
    const [user] = useAuthState(auth);
    const selectedFileRef = useRef<HTMLInputElement>(null);
    const { selectedFile, setSelectedFile, onSelectFile } = useSelectFile();
    const [imageLoading, setImageLoading] = useState(false);
    const [communityStateValue, setCommunityStateValue] = useRecoilState(communityState);

    const onUpdateImage = async () => {
        if (!selectedFile) return;
        if (selectedFile === "Delete") {
            onDeleteImage();
            return;
        }

        setImageLoading(true);
        try {
            const imageRef = ref(storage, `communities/${communityData.id}/image`)
            await uploadString(imageRef, selectedFile, "data_url");
            const downloadURL = await getDownloadURL(imageRef);
            await updateDoc(doc(firestore, "communities", communityData.id), {
                imageURL: downloadURL
            })

            setCommunityStateValue(prev => ({
                ...prev,
                currentCommunity: {
                    ...prev.currentCommunity,
                    imageURL: downloadURL,
                } as Community
            }));
        } catch (error) {
            console.log("onUpdateImage error", error);
        }
        setImageLoading(false);
    };

    const onDeleteImage = async () => {
        setImageLoading(true);
        try {
            // delete community image from storage
            if (communityStateValue.currentCommunity?.imageURL) {
                const imageRef = ref(storage, `communities/${communityData.id}/image`);
                await deleteObject(imageRef);
            }

            // update firestore database (remove imageURL)
            await updateDoc(doc(firestore, "communities", communityData.id), {
                imageURL: deleteField()
            });

            // update recoil atom state
            setCommunityStateValue((prev) => ({
                ...prev,
                currentCommunity: {
                    ...prev.currentCommunity,
                    imageURL: undefined,
                } as Community
            }));
        } catch (error: any) {
            console.log("onDeleteImage error", error)
        }
        setImageLoading(false);
    }

    return (
        <Box position="sticky" top="14px">
            <Flex
                justify="space-between"
                align="center"
                bg="blue.400"
                color="white" p={3}
                borderRadius="4px 4px 0px 0px"
            >
                <Text fontSize="10pt" fontWeight={700}>
                    About Community
                </Text>
                <Icon as={HiOutlineDotsHorizontal} />
            </Flex>
            <Flex
                direction="column" p={3}
                bg="white"
                borderRadius="0px 0px 4px 4px"
            >
                <Stack spacing={2}>
                    <Flex width="100%" p={2} fontSize="10pt" fontWeight={600}>
                        <Flex direction="column" flexGrow={1}>
                            <Text>{communityData?.numberOfMembers?.toLocaleString()}</Text>
                            <Text>Members</Text>
                        </Flex>
                        <Flex direction="column" flexGrow={1}>
                            <Text>1</Text>
                            <Text>Online</Text>
                        </Flex>
                    </Flex>
                    <Divider />
                    <Flex
                        align="center"
                        width="100%"
                        p={1}
                        fontWeight={500}
                        fontSize="10pt"
                    >
                        <Icon as={RiCakeLine} fontSize={18} mr={2} />
                        {communityData.createdAt && (
                            <Text mt={1}>
                                Created{" "}
                                {moment(
                                    new Date(communityData.createdAt.seconds * 1000)
                                ).format("MMM, DD, YYYY")}
                            </Text>
                        )}
                    </Flex>
                    <Link href={(`/r/${communityData.id}/submit`)}>
                        <Button height="30px" width="100%">
                            Create Post
                        </Button>
                    </Link>
                    {user?.uid === communityData.creatorId && (
                        <>
                            <Divider />
                            <Stack spacing={1} fontSize="10pt">
                                <Text fontWeight={600}>Admin</Text>
                                <Flex align="center" justify="space-between">
                                    <Stack direction="row" spacing={2}>
                                        <Text
                                            color="blue.500"
                                            cursor="pointer"
                                            _hover={{ textDecoration: "underline" }}
                                            onClick={() => selectedFileRef.current?.click()}
                                        >
                                            Change Image
                                        </Text>
                                        <Text> | </Text>
                                        <Text color="blue.500"
                                            cursor="pointer"
                                            _hover={{ textDecoration: "underline" }}
                                            onClick={() => setSelectedFile("Delete")}
                                        >
                                            Delete
                                        </Text>
                                    </Stack>
                                    {selectedFile !== "Delete" ? (
                                        communityData.imageURL || selectedFile ? (
                                            <Image objectFit="cover" src={selectedFile || communityData.imageURL} borderRadius="full" boxSize="30px" alt="Community Image" />
                                        ) : (
                                            <Icon
                                                as={FaReddit}
                                                fontSize={30}
                                                color="brand.100"
                                            />
                                        )) : (
                                        <Icon
                                            as={FaReddit}
                                            fontSize={30}
                                            color="brand.100"
                                        />
                                    )}
                                </Flex>
                                {(selectedFile) &&
                                    (imageLoading ? (
                                        <Spinner />
                                    ) : (
                                        <Text cursor="pointer" onClick={onUpdateImage}>
                                            Save Changes
                                        </Text>
                                    ))}
                                <input
                                    id="file-upload"
                                    ref={selectedFileRef}
                                    type="file"
                                    accept="image/x-png, image/gif, image/jpeg"
                                    hidden
                                    onChange={onSelectFile}
                                />
                            </Stack>
                        </>
                    )}
                </Stack>
            </Flex>
        </Box >
    )
}
export default About;