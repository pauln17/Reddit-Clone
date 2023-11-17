import { Timestamp } from "firebase/firestore";
import { atom } from "recoil";

// The information a post stores
export type Post = {
    id?: string;
    communityId: string;
    creatorId: string;
    creatorDisplayName: string;
    title: string;
    body: string;
    numberOfComments: number;
    voteStatus: number;
    imageURL?: string;
    communityImageURL?: string;
    createdAt: Timestamp;
}

// Determines the state of post (either in the single post itself, or viewing community posts)
interface PostState {
    selectedPost: Post | null;
    posts: Post[] // All posts of a community
    // postVotes
}

// Default values for PostState
const defaultPostState: PostState = {
    selectedPost: null,
    posts: [],
}

export const postState = atom<PostState>({
    key: 'postState',
    default: defaultPostState,
})