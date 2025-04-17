"use client";

import StoreProvider from "@/state/redux";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import Auth from "./(auth)/AuthProvider";

const Providers = ({ children }: { children: React.ReactNode }) => {

    return (
        <StoreProvider>
            <Authenticator.Provider>
                <Auth>
                    {children}
                </Auth>
            </Authenticator.Provider>
        </StoreProvider>
    )
}

export default Providers