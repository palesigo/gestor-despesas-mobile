import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
const base="/gestor-despesas-mobile/";
export default defineConfig({base,plugins:[react(),VitePWA({registerType:"autoUpdate",includeAssets:["icon.svg"],manifest:{name:"Registo de Despesas",short_name:"Despesas",description:"Registo familiar de despesas",theme_color:"#2d6a4f",background_color:"#f6f8f7",display:"standalone",lang:"pt-PT",start_url:base,icons:[{src:`${base}icon.svg`,sizes:"any",type:"image/svg+xml",purpose:"any"}]},workbox:{navigateFallback:`${base}index.html`,globPatterns:["**/*.{js,css,html,svg,png,ico}"]}})]});