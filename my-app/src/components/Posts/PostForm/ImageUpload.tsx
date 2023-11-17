import { Button, Flex, Image, Stack } from '@chakra-ui/react';
import React, { useRef } from 'react';

type ImageUploadProps = {
    selectedFile?: string;
    onSelectImage: (event: React.ChangeEvent<HTMLInputElement>) => void;
    setSelectedTab: (value: string) => void;
    setSelectedFile: (value: string) => void;
};

const ImageUpload: React.FC<ImageUploadProps> = ({
    selectedFile,
    onSelectImage,
    setSelectedTab,
    setSelectedFile
}) => {
    const selectedFileRef = useRef<HTMLInputElement>(null);

    return (
        <Flex direction="column" justify="center" align="Center" width="100%">
            {selectedFile ? (
                <>
                    <Image maxWidth="400px" maxHeight="400px" src={selectedFile} />
                    <Stack direction="row" mt={4}>
                        <Button
                            height="28px" onClick={() => setSelectedTab("Post")}
                        >Back to Post</Button>
                        <Button variant="outline" height="28px" onClick={() => setSelectedFile('')}>Remove</Button>
                    </Stack>
                </>
            ) : (
                <Flex
                    justify="center"
                    align="center"
                    p={20}
                    border="1px dashed"
                    borderColor="gray.200"
                    width="100%"
                    borderRadius={4}
                >
                    <Button
                        variant="outline"
                        height="28px"
                        onClick={() => selectedFileRef.current?.click()}
                    >
                        Upload
                    </Button>
                    <input
                        id="file-upload"
                        ref={selectedFileRef}
                        type="file"
                        accept="image/x-png, image/gif, image/jpeg"
                        hidden
                        onChange={onSelectImage}
                    />
                    <img src={selectedFile} />
                </Flex>
            )}
        </Flex>
    )
}
export default ImageUpload;