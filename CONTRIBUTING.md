# vscode-luogu 开发指南

**_本指南编写时的环境为node v20.5.0 + npm v9.8.0_**

## 如何构建本项目

首先，执行 `npm install -g vsce` 安装打包工具。

之后，执行 `npm install` 安装项目依赖。

一切就绪后，使用 `npm run compile` 来编译，或者直接在vscode内按 `F5` 进行调试运行。

## 如何发布新版本

代码全部修改完毕，已经准备好发布新版本时，先运行 `vsce package` 确保插件可以正确打包，之后请在 `CHANGELOG.md` 中简要说明更新内容，并更新 `package.json` 和 `extension.js` 中的版本号。

将更新了版本号的代码上传到GitHub并在QQ群里通知其他开发者经同意后，在GitHub上创建新的Release并将最后一次commit自动生成的vsix文件上传至Release附件。Release发布后，GitHub action将自动将你的贡献发布至VSCode Marketplace.

## 编写时需要注意的问题

上传前运行 `npm run fix;npm run prettier`
暂定，多在群里商量吧。
