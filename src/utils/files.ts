import * as vscode from 'vscode'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import Ajv from 'ajv'

const luoguJSONfileSchema = new Ajv().compile({
    type: "object",
    properties: {
        uid: { type: "string" },
        clientID: { type: "string" },
        version: { type: "string" },
        savedProblem: { type: "array", items: { type: "string" } }
    },
    required: ["uid", "clientID", "version", "savedProblem"]
})

globalThis.luoguPath = path.join(os.homedir(), '.luogu')
globalThis.luoguJSONPath = path.join(globalThis.luoguPath, "luogu.json")

export var config = {
    uid: '',
    clientID: '',
    version: '',
    savedProblem: new Array<string>
}

const updateConfig = function () { fs.writeFileSync(globalThis.luoguJSONPath, JSON.stringify(config)); }

export const initFiles = function (rootPath: string): [any, string] | null {
    globalThis.rootPath = rootPath;
    globalThis.resourcesPath = path.join(rootPath, 'resources')
    globalThis.distPath = path.join(rootPath, 'dist')
    try {
        if (!fs.existsSync(globalThis.luoguPath)) fs.mkdirSync(globalThis.luoguPath);
    } catch (err) { return [err, "创建配置文件失败。"]; }
    try {
        if (!fs.existsSync(globalThis.luoguJSONPath)
            || !luoguJSONfileSchema(config = JSON.parse(fs.readFileSync(globalThis.luoguJSONPath).toString())))
            fs.writeFileSync(globalThis.luoguJSONPath, JSON.stringify(
                config = { uid: '', clientID: '', version: '', savedProblem: [] }
            ));
    } catch (err) {
        if (err instanceof SyntaxError)
            try {
                fs.writeFileSync(globalThis.luoguJSONPath, JSON.stringify(
                    config = { uid: '', clientID: '', version: '', savedProblem: [] }
                ));
            } catch (err) { return [err, "创建配置文件失败。"]; }
        else return [err, "创建配置文件失败。"];
    }
    return null;
}

export const changeCookie = function (s: { uid: string, clientID: string }) {
    config.uid = s.uid, config.clientID = s.clientID;
    updateConfig();
}
export const changeCookieByCookies = function (cookie: string[] | undefined) {
    let s = { uid: config.uid, clientID: config.clientID };
    if (cookie)
        for (let cookie_info of cookie) {
            if (cookie_info.match("_uid")?.index == 0) {
                let match_res = cookie_info.match("(?<=\=).*?(?=;)");
                if (match_res) s.uid = match_res[0];
            }
            if (cookie_info.match("__client_id")?.index == 0) {
                let match_res = cookie_info.match("(?<=\=).*?(?=;)");
                if (match_res) s.clientID = match_res[0];
            }
        }
    changeCookie(s);
}
export const cookieConfig = function () { return { headers: { Cookie: `_uid=${config.uid};__client_id=${config.clientID}` } }; };

export const setVersion = function (version: string) {
    config.version = version;
    updateConfig();
}

export const saveProblem = function (pid: string, html: string) {
    if (!config.savedProblem.includes(pid)) {
        config.savedProblem.push(pid);
        updateConfig();
    }
    const filename = pid + '.html';
    fs.writeFileSync(path.join(globalThis.luoguPath, filename), html);
}
export const removeSavedProblem = function (pid: string) {
    config.savedProblem.filter(p => p != pid);
    let pth = path.join(globalThis.luoguPath, pid + '.html');
    if (fs.existsSync(pth))
        fs.unlinkSync(pth);
    updateConfig();
}
export const getSavedProblem = function (pid: string) {
    return fs.readFileSync(path.join(globalThis.luoguPath, pid + '.html')).toString();
}

export const saveUserIconCache = function (uid: number, image: Buffer) {
    fs.writeFileSync(path.join(globalThis.luoguPath, `${uid}.jpg`), image);
    fs.writeFileSync(path.join(globalThis.luoguPath, `${uid}.savetime.txt`), (new Date()).getTime().toString())
}
export const loadUserIconCache = function (uid: number) {
    if (fs.existsSync(path.join(globalThis.luoguPath, `${uid}.jpg`))
        && fs.existsSync(path.join(globalThis.luoguPath, `${uid}.savetime.txt`))
        && ((new Date()).getTime() - parseInt(fs.readFileSync(path.join(globalThis.luoguPath, `${uid}.savetime.txt`)).toString())) <= +vscode.workspace.getConfiguration('luogu').get<'integer'>('effectiveDuration')!
        && parseInt(fs.readFileSync(path.join(globalThis.luoguPath, `${uid}.savetime.txt`)).toString()) > 1698564000) // 此时的用户头像存储方式由 base64 转为了二进制，以前的缓存直接失效
        return fs.readFileSync(path.join(globalThis.luoguPath, `${uid}.jpg`));
    else return null;
}