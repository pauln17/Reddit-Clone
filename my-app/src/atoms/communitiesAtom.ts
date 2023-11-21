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

// Creates an interface called CommunityState that stores the user's communitySnippets subcollection and the currentCommunity they are accessing on a page.
interface CommunityState {
    mySnippets: CommunitySnippet[],
    currentCommunity?: Community;
    snippetsFetched: boolean;
}

// Sets default values for the CommunityState interface
const defaultCommunityState: CommunityState = {
    mySnippets: [],
    snippetsFetched: false,
}

// Creates a recoil atom state that can be accessed globally
export const communityState = atom<CommunityState>({
    key: 'communitiesState',
    default: defaultCommunityState,
})