// 1. Import `extendTheme`
import "@fontsource/open-sans"
import { extendTheme } from "@chakra-ui/react"
import { Button } from './buttons'

// 2. Call `extendTheme` and pass your custom values
export const theme = extendTheme({
  colors: {
    brand: {
      100: "#FF3c00",
      900: "#1a202c",
    },
  },
  // Font
  fonts: {
    body: 'Open Sans, sans-serif',
  },
  // Set a global color theme for everything using Chakra UI's preset colors
  styles: {
    global: () => ({
        body: {
            bg: "gray.200"
        }
    })
  },
  // Components that are provided by Chakra UI
  components: {
    Button, 
  }
})