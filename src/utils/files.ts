import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import Ajv from 'ajv'

const luoguJSONfileSchema = new Ajv().compile({
    type: "object",
    properties: {
        uid: { type: "string" },
        clientID: { type: "string" }
    },
    required: ["uid", "clientID"]
})

globalThis.luoguPath = path.join(os.homedir(), '.luogu')
globalThis.luoguJSONPath = path.join(globalThis.luoguPath, "luogu.json")
globalThis.versionPath = path.join(globalThis.luoguPath, 'version')

export var uid = '', clientID = '';
export const changeCookie=function(s:{uid:string,clientID:string}){
    fs.writeFileSync(globalThis.luoguJSONPath, JSON.stringify({ 'uid': uid=s.uid, 'clientID': clientID=s.clientID}));
}
export const changeCookieByCookies=function(cookie:string[]|undefined){
    let s={uid:uid,clientID:clientID};
    if (cookie)
        for (let cookie_info of cookie) {
        if (cookie_info.match("_uid")?.index == 0) {
            let match_res = cookie_info.match("(?<=\=).*?(?=;)");
            if (match_res) s.uid=match_res[0];
        }
        if (cookie_info.match("__client_id")?.index == 0) {
            let match_res = cookie_info.match("(?<=\=).*?(?=;)");
            if (match_res) s.clientID=match_res[0];
        }
    }
    changeCookie(s);
}
export const cookieConfig = function () { return { headers: { Cookie: `_uid=${uid};__client_id=${clientID}` } }; };

export const initFiles = function (rootPath: string): [any, string] | null {
    globalThis.resourcesPath = path.join(rootPath, 'resources')
    try {
        if (!fs.existsSync(globalThis.luoguPath)) fs.mkdirSync(globalThis.luoguPath);
    } catch (err) { return [err, "创建文件夹失败。"]; }
    let luoguJSONfile:any;
    try {
        if (!luoguJSONfileSchema(luoguJSONfile = JSON.parse(fs.readFileSync(globalThis.luoguJSONPath).toString())))
            fs.writeFileSync(globalThis.luoguJSONPath, JSON.stringify({ 'uid': '', 'clientID': '' })),
                luoguJSONfile = { uid: '', clientID: '' };
    } catch (err) {
        if (err instanceof SyntaxError)
            try {
                fs.writeFileSync(globalThis.luoguJSONPath, JSON.stringify({ 'uid': '', 'clientID': '' })),
                    luoguJSONfile = { uid: '', clientID: '' };
            } catch (err) { return [err, "创建 cookies 配置文件失败。"]; }
        else return [err, "创建 cookies 配置文件失败。"];
    }
    uid=luoguJSONfile.uid,clientID=luoguJSONfile.clientID;
    return null;
}

export const getVersionFile = function () {
    try { return fs.readFileSync(globalThis.versionPath).toString(); }
    catch { return undefined; }
}
export const setVersionFile = function (version: string) {
    fs.writeFileSync(globalThis.versionPath, version);
}