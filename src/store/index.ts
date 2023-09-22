import { createStore } from 'redux'

// tslint:disable-next-line: no-empty
function appStore() { }

export * from '../utils/shared'

export const store = createStore(appStore)

export default store
