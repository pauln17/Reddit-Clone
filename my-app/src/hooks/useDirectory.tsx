import React, { useEffect } from 'react';
import { useRecoilValue, useRecoilState } from 'recoil';
import { DirectoryMenuItem, defaultMenuItem, directoryMenuState } from '../atoms/directoryMenuAtom';
import { useRouter } from 'next/router';
import { communityState } from '../atoms/communitiesAtom';
import { FaReddit } from 'react-icons/fa';
import useSelectFile from './useSelectFile';


const useDirectory = () => {
    const [directoryState, setDirectoryState] = useRecoilState(directoryMenuState);
    const router = useRouter()
    const communityStateValue = useRecoilValue(communityState);

    const onSelectMenuItem = (menuItem: DirectoryMenuItem) => {
        setDirectoryState((prev) => ({
            ...prev,
            selectedMenuItem: menuItem
        }));

        router.push(menuItem.link);

        if (directoryState.isOpen) {
            toggleMenuOpen();
        }
    }

    const toggleMenuOpen = () => {
        setDirectoryState(prev => ({
            ...prev,
            isOpen: !directoryState.isOpen
        }));
    };

    useEffect(() => {
        const { currentCommunity } = communityStateValue;
        if (currentCommunity.id) {
            setDirectoryState((prev) => ({
                ...prev,
                selectedMenuItem: {
                    displayText: `r/${currentCommunity.id}`,
                    link: `/r/${currentCommunity.id}`,
                    imageURL: currentCommunity.imageURL,
                    icon: FaReddit,
                    iconColor: "blue.500"
                }
            }));
            return;
        }
        setDirectoryState((prev) => ({
            ...prev,
            selectedMenuItem: defaultMenuItem,
        }));
    }, [communityStateValue.currentCommunity])

    return {
        directoryState,
        setDirectoryState,
        toggleMenuOpen,
        onSelectMenuItem,
    };
}
export default useDirectory;