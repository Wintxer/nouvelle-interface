import pluginTerminal from "vite-plugin-terminal"
import mkcert from "vite-plugin-mkcert"
import { defineConfig } from "vite"

export default defineConfig ({
    root: 'src',
    build: {
        outDir: '../dist'
    },
    server: {
        https: false
    },
    plugin: [
        mkcert(), // npm i -D vite-plugin-mkcert
        pluginTerminal({ console: 'terminal' })
    ] 
})