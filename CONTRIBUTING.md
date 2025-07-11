# vscode-luogu 开发指南

**_本指南编写时的环境为node v20.5.0 + npm v9.8.0_**

## 如何构建本项目

- 执行 `npm install` 安装项目依赖。

一切就绪后，使用 `npm run compile` 来编译，或者直接在vscode内按 `F5` 进行调试运行。

> [!TIP]
> 构建前需要执行 `git submodule init` 和 `git submodule update` 确保 `luogu-api-docs` 存在

## 如何发布新版本

代码全部修改完毕，已经准备好发布新版本时，先运行 `npm run pack` 确保插件可以正确打包，之后请在 `CHANGELOG.md` 中简要说明更新内容，并更新 `package.json` 中的版本号。

将更新了版本号的代码上传到GitHub并在QQ群里通知其他开发者经同意后，在GitHub上创建新的Release，并编写发布说明。Release发布后，GitHub action将自动打包，上传到release附件与VSCode Marketplace中。

## 编写时需要注意的问题

上传前运行 `npm run fix;npm run prettier`

暂定，多在群里商量吧。
