import { resolve } from "path";
import path from "path";
import CopyWebpackPlugin from "copy-webpack-plugin";
import { DefinePlugin } from "webpack";
// import { transpile } from "typescript";
import {plugins} from "prismjs";
import cesium from 'vite-plugin-cesium';

// const cesiumSource = "node_modules/cesium/source";
// const cesiumBaseUrl = "/";
// const path = require("path");

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  app: {
    // baseURL: "/my-app3"
  }, 
  devtools: { enabled: true },

  // alias: {
  //   '@': resolve(__dirname, "/") 
  // }, 
  css: [
    "~/assets/css/main.css", 
    "cesium/Build/Cesium/Widgets/widgets.css", 
    // "mapbox-gl/dist/mapbox-gl.css"
  ],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  compatibilityDate: "2024-07-05",
  vite: {
    plugins: [
      cesium()
    ]
  }, 
  hooks: {
    "vite:extendConfig": (config, {isClient}) => {
      if (isClient) {
        config.plugins.push(
          cesium()
        )
      }
    }
  }, 
  build: {
    rollupOptions: {
      plugins: [
        cesium()
      ]
    }
  },
  cesium: {
    cesiumPath: '/cesium',
  },

  modules: [
    'nuxt-mapbox'
  ], 

  mapbox: {
    accessToken: 'pk.eyJ1IjoiY2hhcmxpZTE1MDAxIiwiYSI6ImNseWI2cjY5dTB2Ym0yanF3dWFhM3lzaGgifQ.H-XYHkcUG289Yj0cndv8TA'
  }
})