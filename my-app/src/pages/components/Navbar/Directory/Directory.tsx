import { authModalState } from '@/src/atoms/authModalAtom';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { Flex, Icon, Menu, MenuButton, MenuList, Text } from '@chakra-ui/react';
import React from 'react';
import { useSetRecoilState } from 'recoil';
import { TiHome } from 'react-icons/ti';
import Communities from './Communities';

const UserMenu: React.FC = () => {
    const setAuthModalState = useSetRecoilState(authModalState);

    return (
        <Menu>
            <MenuButton
                cursor="pointer"
                padding="0px 6px"
                borderRadius={4}
                _hover={{ outline: "1px solid", outlineColor: "gray.200" }}
                mr={2}
                ml={{ base: 0, md: 2 }}
            >
                <Flex
                    align="center"
                    justify="space-between"
                    width={{ base: "auto", lg: "200px" }}
                >
                    <Flex align="center">
                        <Icon fontSize={24} mr={{ base: 1, md: 2 }} as={TiHome} />
                        <Flex display={{ base: "none", lg: "flex" }} align="center">
                            <Text fontWeight={600} fontSize="10pt" mt={1}>
                                Home
                            </Text>
                        </Flex>
                    </Flex>
                    <ChevronDownIcon />
                </Flex>
            </MenuButton>
            <MenuList>
                <Communities/>
            </MenuList>
        </Menu>
    )
}
export default UserMenu;