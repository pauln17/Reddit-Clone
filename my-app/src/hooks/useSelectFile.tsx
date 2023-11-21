import React, { useRef, useState } from 'react';

const useSelectFile = () => {
    const [selectedFile, setSelectedFile] = useState<string>();
    
    const onSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        // built in JS API allowing users to read files asynchronously
        const reader = new FileReader();

        // if image url exists, set reader to be the image's data url
        if (event.target.files?.[0]) {
            reader.readAsDataURL(event.target.files[0]);
        }

        // onload triggers when the reader has finished reading the file
        reader.onload = (readerEvent) => {
            // if the result is available, set selectedFile to store it
            if (readerEvent.target?.result) {
                // We know that reader will not return an array of multiple files, but only one
                // Thus, we type cast here to tell it that it will be a string 
                setSelectedFile(readerEvent.target.result as string);
            }
        }
    };

    return {
        selectedFile,
        setSelectedFile,
        onSelectFile,
    }
}
export default useSelectFile;