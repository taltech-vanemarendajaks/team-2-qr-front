import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import VueAxios from "vue-axios";
import axios from "axios";

import "@/assets/css/style.css"
import "@/assets/css/base.css"
import "@/assets/css/components/feature-panel.css"
import "@/assets/css/views/home-view.css"
import "@/assets/css/views/auth-view.css"
import "@/assets/css/components/auth-menu.css";
import "@/assets/css/components/auth-input.css";
import "@/assets/css/components/google-signin.css";

// bootstrap
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap.js"

// Font Awesome imports
import {library} from '@fortawesome/fontawesome-svg-core'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {faArrowRightFromBracket, faUserSecret, faPenToSquare, faTrash, faQrcode, faSort, faCheck} from '@fortawesome/free-solid-svg-icons'
import {faEye, faEyeSlash, far} from '@fortawesome/free-regular-svg-icons'

// Add the imported icons to the library
library.add(faArrowRightFromBracket, faUserSecret, far,faPenToSquare, faTrash, faQrcode, faEye, faEyeSlash, faSort, faCheck)

const app = createApp(App)

// Register the FontAwesomeIcon component globally
app.component('font-awesome-icon', FontAwesomeIcon)

app.use(router)
app.use(VueAxios, axios)
app.mount('#app')