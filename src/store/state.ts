import { ExtensionContext } from 'vscode'

interface IContext {
  value: ExtensionContext | null,
}

interface IAccessor<T> {
  value: T,
}

const createProperty = <T>(initialValue: T): IAccessor<T> => {
  let obj = { inner: initialValue }
  return Object.create(
    obj,
    {
      value: {
        get: () => obj.inner,
        set: (value: T) => obj.inner = value,
      }
    }
  )
}

const createPersistenceProperty = <T>(key: string): IAccessor<T | undefined> => Object.create(
  Object.prototype,
  {
    value: {
      get: () => context.value!.globalState.get<T>(key),
      set: (value: T) => context.value!.globalState.update(key, value)
    }
  }
)

const createPersistencePropertyDefault = <T>(key: string, defaultValue: T): IAccessor<T> => Object.create(
  Object.prototype,
  {
    value: {
      get: () => context.value!.globalState.get<T>(key, defaultValue),
      set: (value: T) => context.value!.globalState.update(key, value)
    }
  }
)

export const context: IContext = {
  value: null
}

export const globalState = {
  cid: createPersistenceProperty<string>('cid'),
  pid: createPersistenceProperty<string>('pid'),
  uid: createPersistenceProperty<string>('uid'),
  clientID: createPersistenceProperty<string>('client_id'),
  version: createPersistenceProperty<string>('version')
}

export const state = {
  logged: createProperty<boolean>(false),
  initialed: createProperty<boolean>(false)
}
