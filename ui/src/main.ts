/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from './plugins'

// Styles. Taken from the installed asciinema-player package so that they always
// match the player code: a mismatched version renders an empty terminal.
import 'asciinema-player/dist/bundle/asciinema-player.css'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

const app = createApp(App)

registerPlugins(app)

app.mount('#app')
