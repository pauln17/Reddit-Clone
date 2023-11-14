import { atom } from "recoil"

// Creates an interface that expects these values/types for the authentication modal
export interface AuthModalState {
    open: boolean;
    view: "login" | "signup" | "resetPassword";
}

// Sets default values for the interface AuthModalState
const defaultModalState: AuthModalState = {
    open: false,
    view: 'login'
}

// Creates a recoil atom state that can be accessed globally
export const authModalState = atom<AuthModalState>({
    key: "authModalState",
    default: defaultModalState,
})