import React, { useEffect, useState } from 'react';
import { CreateCommunityModal } from '../../Modal/CreateCommunity/CreateCommunityModal';
import { MenuItem, Flex, Icon, Box, Text } from '@chakra-ui/react';
import { GrAdd } from 'react-icons/gr';
import { communityState } from '@/src/atoms/communitiesAtom';
import { useRecoilValue } from 'recoil';
import MenuListItem from './MenuListItem';
import { FaReddit } from 'react-icons/fa';

type CommunitiesProps = {

};

const Communities: React.FC<CommunitiesProps> = () => {
    const [open, setOpen] = useState(false);
    const mySnippets = useRecoilValue(communityState).mySnippets;

    return (
        <>
            <CreateCommunityModal open={open} handleClose={() => setOpen(false)} />
            <Box mt={3} mb={3}>
                <Text pl={3} mb={1} fontSize="7pt" fontWeight={500} color="gray.500">
                    MODERATING
                </Text>
                {mySnippets
                    .filter((snippet) => snippet.isModerator)
                    // .sort((a, b) => (a.communityId).localeCompare(b.communityId))
                    .map((snippet) => (
                        <MenuListItem
                            key={snippet.communityId}
                            icon={FaReddit}
                            displayText={`r/${snippet.communityId}`}
                            link={`/r/${snippet.communityId}`}
                            iconColor="brand.100"
                            imageURL={snippet.imageURL}
                        />
                    ))}
            </Box>
            <Box mt={3} mb={3}>
                <Text pl={3} mb={1} fontSize="7pt" fontWeight={500} color="gray.500">MY COMMUNITIES</Text>
                <MenuItem
                    width="100%"
                    fontSize="10pt"
                    _hover={{ bg: "gray.100" }}
                    onClick={() => setOpen(true)}
                >
                    <Flex align="center">
                        <Icon as={GrAdd} fontSize={20} mr={2} />
                        Create Community
                    </Flex>
                </MenuItem>
                {mySnippets
                    // .sort((a, b) => (a.communityId).localeCompare(b.communityId))
                    .map((snippet) => (
                        <MenuListItem
                            key={snippet.communityId}
                            icon={FaReddit}
                            displayText={`r/${snippet.communityId}`}
                            link={`/r/${snippet.communityId}`}
                            iconColor="brand.100"
                            imageURL={snippet.imageURL}
                        />
                    ))}
            </Box>
        </>
    )
}
export default Communities;