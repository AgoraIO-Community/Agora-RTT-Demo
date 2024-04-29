import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import svgr from "vite-plugin-svgr"
import { name } from "./package.json"

const genBaseUrl = (mode) => {
  if (mode !== "development") {
    if (mode == "test") {
      return `/${name}-test/`
    }
    return `/${name}/`
  }
  return "/"
}

export default defineConfig(({ mode }) => {
  return {
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    base: genBaseUrl(mode),
    build: {
      // cssCodeSplit: false,
      // target: "es2015",
    },
    server: {
      watch: {
        // usePolling: true
      },
    },
    plugins: [
      react(),
      svgr({
        svgrOptions: {
          // icon: true,
          // typescript: true,
        },
      }),
    ],
    css: {
      modules: {
        // hashPrefix: 'hash',
        // generateScopedName: "[name]__[local]__[hash:base64:2]",
        // globalModulePaths: [
        //   /.*\\.global\\..*/
        // ]
      },
      postcss: {
        plugins: [],
      },
    },
  }
})
