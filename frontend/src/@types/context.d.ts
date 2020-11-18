export interface IAuthContext {
    userID: string | null;
    type: string | null;
    token: string | null;
    tokenExpiration: number;
    login: (userID: string, type: string, token: string, tokenExpiration: number) => void;
    logout: () => void;
}
