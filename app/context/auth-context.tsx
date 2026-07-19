import { createContext, ReactNode, useContext, useState } from 'react';

interface AuthContextProps{
    accessToken: string
    setAccessToken: (token: string) => void
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export function AuthProvider({ children }: AuthProviderProps) {
    const [accessToken, setAccessToken] = useState('');

    return (
        <AuthContext.Provider value={{ accessToken, setAccessToken }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(){
    return useContext(AuthContext)
}