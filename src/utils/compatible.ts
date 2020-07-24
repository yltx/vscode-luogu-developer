import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { globalState } from '@/store/state'
import { IUserToken } from '@/model/Auth'

const oldLuoguPath = path.join(os.homedir(), '.luogu')
const oldVersionPath = path.join(oldLuoguPath, 'version')
const oldLuoguJSONPath = path.join(oldLuoguPath, 'luogu.json')
const oldLuoguClientIDPath = path.join(oldLuoguPath, 'CsrfToken.json')
const oldLuoguUidPath = path.join(oldLuoguPath, 'uid.json')

export const getVersion = () => {
  if (fs.existsSync(oldVersionPath)) {
    const version = fs.readFileSync(oldVersionPath).toString()
    fs.unlinkSync(oldVersionPath)
    return version
  } else {
    return globalState.version.value
  }
}

export const getUserToken = (): IUserToken | null => {
  if (fs.existsSync(oldLuoguClientIDPath) && fs.existsSync(oldLuoguUidPath)) {
    const clientID = fs.readFileSync(oldLuoguClientIDPath).toString()
    const uid = fs.readFileSync(oldLuoguUidPath).toString()
    fs.unlinkSync(oldLuoguClientIDPath)
    fs.unlinkSync(oldLuoguUidPath)
    return { clientID, uid }
  }

  if (fs.existsSync(oldLuoguJSONPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(oldLuoguJSONPath).toString())
      return {
        clientID: data.clientID,
        uid: data.uid
      }
    } catch (err) {}
  }

  if (globalState.uid.value !== undefined && globalState.clientID.value !== undefined) {
    return {
      uid: globalState.uid.value,
      clientID: globalState.clientID.value
    }
  }

  return null
}
