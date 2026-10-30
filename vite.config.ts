import {defineConfig} from 'vite';
export default defineConfig({server:{proxy:{'/push-api':'http://127.0.0.1:4186'}},preview:{proxy:{'/push-api':'http://127.0.0.1:4186'}}});
