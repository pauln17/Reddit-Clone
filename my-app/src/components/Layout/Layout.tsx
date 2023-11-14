import React, { ReactNode } from 'react';
import Navbar from '../Navbar/Navbar';

const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <>
            <Navbar />
            <main>{children}</main> 
            {/* Children is practically just a bunch of react components */}
        </>
    )
}

export default Layout;