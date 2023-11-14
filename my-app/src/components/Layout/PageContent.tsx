import { Flex } from '@chakra-ui/react';
import React, { ReactNode } from 'react';

const PageContent: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <Flex justify="center" padding="16px 0px">
            <Flex
                width="95%"
                justify="Center"
                maxWidth="860px"
            >
                {/* LHS */}
                <Flex
                    direction="column"
                    width={{
                        base: "100%", md: "65%"
                    }}
                    mr={{ base: 0, md: 6 }}
                >
                    {children && children[0 as keyof typeof children]}
                </Flex>

                {/* RHS */}
                <Flex
                    direction="column"
                    display={{ base: "none", md: "flex" }}
                    flexGrow={1}
                >
                    {children && children[1 as keyof typeof children]}
                </Flex>
            </Flex>
        </Flex>
    )
}
export default PageContent;