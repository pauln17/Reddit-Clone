import { Timestamp } from "firebase/firestore";
import { atom } from "recoil";

export interface Community {
    id: string;
    creatorId: string;
    numberOfMembers: number;
    privacyType: "public" | "restricted" | "private";
    createdAt?: Timestamp;
    imageURL?: string;
}

// Create an interface (what to expect) of the communitySnippet subcollection within users document
export interface CommunitySnippet {
    communityId: string;
    isModerator?: boolean;
    imageURL?: string;
}

// Creates an interface called community state that expects an array called "mySnippets" that expects an array of type interface communitySnippet from above
interface CommunityState {
    mySnippets: CommunitySnippet[],
    currentCommunity?: Community;
}

// Sets default values for the CommunityState interface
const defaultCommunityState: CommunityState = {
    mySnippets: []
}

// Creates a recoil atom state that can be accessed globally
export const communityState = atom<CommunityState>({
    key: 'communitiesState',
    default: defaultCommunityState,
})