export interface User {
    id?: number;
    username: string;
    email: string;
    password?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface AuthResponse {
    user: Omit<User, 'password'>;
    token: string;
}
