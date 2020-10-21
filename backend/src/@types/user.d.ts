export interface IUser {
    userID: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    email: string;
    password: string;
    type: string;
}

export interface IUserAuth {
    userID: string;
    token: string;
    tokenExpiration: int;
}

export interface IUserInp {
    userID: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    email: string;
    password: string;
    type: string;
}
