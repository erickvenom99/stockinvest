export type User = {
    id: string;
    username: string;
    email: string;
    profileImage?: string;
    createdAt?: string;
};

export type UserContextType = {
    user: User | null;
    loading: boolean;
    error: string | null;
    logout: () => void;
    fetchUser: () => Promise<void>;
}