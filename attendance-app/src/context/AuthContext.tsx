import { createContext, useState, useEffect, FC, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (token: string) => Promise<void>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    login: async () => { },
    logout: async () => { },
});

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkToken = async () => {
            const token = await SecureStore.getItemAsync('userToken');
            setIsAuthenticated(!!token);
        };
        checkToken();
    }, []);

    const login = async (token: string) => {
        await SecureStore.setItemAsync('userToken', token);
        setIsAuthenticated(true);
    };

    const logout = async () => {
        await SecureStore.deleteItemAsync('userToken');
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};