import SuperCommand from '../SuperCommand';
import * as vscode from 'vscode';
import axios from '@/utils/api';
import { getWebviewViewColumn } from '@/utils/workspaceUtils';

export default new SuperCommand({
  onCommand: 'paintboard',
  handle: async () => {
    const panel = vscode.window.createWebviewPanel(
      ``,
      `冬日绘板`,
      getWebviewViewColumn(),
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.file(globalThis.resourcesPath),
          vscode.Uri.file(globalThis.distPath)
        ]
      }
    );
    panel.webview.onDidReceiveMessage(async message => {
      if (message.type === 'error') {
        vscode.window.showErrorMessage(message.message);
        return;
      }
      console.log(`Got ${message.type} request.`);
      const paintboard = await axios
        .get('https://www.luogu.com.cn/paintboard/board')
        .then(data => data?.data);
      panel.webview.postMessage({
        type: 'init',
        board: paintboard
      });
    });
    panel.webview.html = `
    <!doctype html>
	<html>
	<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1 user-scalable=no">
	<title>冬日绘版 - 洛谷</title>
	<style>
	    * { box-sizing: border-box; }
	    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
	    header {
	        background: #2d3e50; color: #fff; padding: 10px 20px;
	        position: fixed; top: 0; left: 0; right: 0; z-index: 100;
	    }
	    header h1 { margin: 0; font-size: 18px; }
	    header a { color: #fff; text-decoration: none; }
	    .container { margin-top: 50px; padding: 20px; }
	    .toolbar { margin: 10px 0; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
	    .toolbar button {
	        padding: 6px 16px; border: 1px solid #ccc; border-radius: 4px;
	        cursor: pointer; background: #fff;
	    }
	    .toolbar button:hover { background: #e8e8e8; }
	    .toolbar .btn-primary { background: #3498db; color: #fff; border-color: #3498db; }
	    .toolbar .btn-secondary { background: #95a5a6; color: #fff; border-color: #95a5a6; }
	    .toolbar .btn-success { background: #2ecc71; color: #fff; border-color: #2ecc71; }
	    #timeleft { background: #95a5a6; color: #fff; padding: 4px 10px; border-radius: 3px; }
	    .paleitem {
	        margin: 3px; width: 20px; height: 20px; border-radius: 3px;
	        display: inline-block; cursor: pointer; border: 2px solid transparent;
	    }
	    .paleitem.selected { border-color: #DAA520; }
	    #palette {
	        padding: 10px; background: #7f7f7f; margin: 10px 0;
	        width: 540px; border-radius: 4px;
	    }
	    #canvas-box {
	        width: 1000px; height: 630px; padding: 0;
	        overflow: hidden; border: 1px solid #ccc; position: relative;
	    }
	    #mycanvas { position: absolute; cursor: move; }
	</style>
	</head>
	<body>
	<header>
	<h1><a href="#">洛谷冬日绘版</a></h1>
	</header>
	<div class="container">
	<div id="canvas-box">
	<canvas width=5000 height=3000 id="mycanvas"></canvas>
	</div>
	<div class="toolbar">
	<span id="timeleft"></span>
	<button data-zoom="1">全部显示</button>
	<button data-zoom="5">放大5x</button>
	<button data-zoom="10">放大10x</button>
	</div>
	<div id="palette"></div>
	</div>
	<script>
	    const vscode = acquireVsCodeApi();

	    const H = 600, W = 1000;
	    let nowcolor = 0, scale = 5, dragged = 0;
	    const activityStartTime = 1640966400, activityEndTime = 1641225600;
	    const colorlist = ['rgb(0, 0, 0)', 'rgb(255, 255, 255)', 'rgb(170, 170, 170)', 'rgb(85, 85, 85)', 'rgb(254, 211, 199)', 'rgb(255, 196, 206)', 'rgb(250, 172, 142)', 'rgb(255, 139, 131)', 'rgb(244, 67, 54)', 'rgb(233, 30, 99)', 'rgb(226, 102, 158)', 'rgb(156, 39, 176)', 'rgb(103, 58, 183)', 'rgb(63, 81, 181)', 'rgb(0, 70, 112)', 'rgb(5, 113, 151)', 'rgb(33, 150, 243)', 'rgb(0, 188, 212)', 'rgb(59, 229, 219)', 'rgb(151, 253, 220)', 'rgb(22, 115, 0)', 'rgb(55, 169, 60)', 'rgb(137, 230, 66)', 'rgb(215, 255, 7)', 'rgb(255, 246, 209)', 'rgb(248, 203, 140)', 'rgb(255, 235, 59)', 'rgb(255, 193, 7)', 'rgb(255, 152, 0)', 'rgb(255, 87, 34)', 'rgb(184, 63, 39)', 'rgb(121, 85, 72)'];

	    const myarr = [];
	    for (let i = 0; i < H; i++) {
	        myarr[i] = [];
	        for (let j = 0; j < W; j++) myarr[i][j] = '#dddddd';
	    }

	    function render(arr) {
	        const c = document.getElementById("mycanvas");
	        const ctx = c.getContext("2d");
	        for (let i = 0; i < H; i++)
	            for (let j = 0; j < W; j++) {
	                ctx.fillStyle = arr[i][j];
	                ctx.fillRect(j * scale, i * scale, scale, scale);
	            }
	    }

	    function update(y, x, color) {
	        if (dragged) { dragged = 0; return; }
	        const c = document.getElementById("mycanvas");
	        const ctx = c.getContext("2d");
	        ctx.fillStyle = color;
	        ctx.fillRect(x * 5, y * 5, 5, 5);
	    }

	    function initpale() {
	        const palette = document.getElementById('palette');
	        palette.innerHTML = '';
	        colorlist.forEach(function(k, v) {
	            const el = document.createElement('div');
	            el.className = 'paleitem';
	            el.dataset.cid = String(v);
	            el.style.background = k;
	            el.addEventListener('click', function() {
	                document.querySelectorAll('.paleitem').forEach(p => p.classList.remove('selected'));
	                this.classList.add('selected');
	                nowcolor = parseInt(this.dataset.cid);
	            });
	            palette.appendChild(el);
	        });
	        zoom(1);
	    }

	    function zoom(s) {
	        scale = s;
	        const c = document.getElementById('mycanvas');
	        c.style.width = (1000 * scale) + 'px';
	        if (s === 1) { c.style.top = '0px'; c.style.left = '0px'; }
	    }

	    document.querySelectorAll('[data-zoom]').forEach(btn => {
	        btn.addEventListener('click', function() { zoom(parseInt(this.dataset.zoom)); });
	    });

	    // Native drag
	    const canvas = document.getElementById('mycanvas');
	    let isDragging = false, dragStartX, dragStartY, canvasStartX, canvasStartY;
	    canvas.addEventListener('mousedown', function(e) {
	        isDragging = true;
	        dragStartX = e.clientX; dragStartY = e.clientY;
	        canvasStartX = parseInt(canvas.style.left) || 0;
	        canvasStartY = parseInt(canvas.style.top) || 0;
	        e.preventDefault();
	    });
	    document.addEventListener('mousemove', function(e) {
	        if (!isDragging) return;
	        canvas.style.left = (canvasStartX + e.clientX - dragStartX) + 'px';
	        canvas.style.top = (canvasStartY + e.clientY - dragStartY) + 'px';
	    });
	    document.addEventListener('mouseup', function() {
	        if (isDragging) { isDragging = false; dragged = 1; }
	    });

	    // Mouse wheel zoom
	    document.getElementById('canvas-box').addEventListener('wheel', function(event) {
	        event.preventDefault();
	        const y = Math.floor(event.offsetY / scale);
	        const x = Math.floor(event.offsetX / scale);
	        if (event.deltaY > 0) {
	            if (scale === 10) zoom(5); else if (scale === 5) zoom(1);
	        } else {
	            if (scale === 1) zoom(5); else if (scale === 5) zoom(10);
	        }
	        if (scale !== 1) {
            canvas.style.top = (-y * scale + 300) + 'px';
            canvas.style.left = (-x * scale + 500) + 'px';
        }
	    }, { passive: false });

	    function getDateTime(timestamp, isRangeEnd) {
	        const d = new Date(timestamp * 1000);
	        let is2400 = false;
	        if (isRangeEnd && d.getHours() === 0 && d.getMinutes() === 0) {
	            d.setHours(-24); is2400 = true;
	        }
	        let s = d.getFullYear() + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + String(d.getDate()).padStart(2, '0') + ' ';
	        s += is2400 ? '24:00' : String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
	        return s;
	    }

	    function getFormattedTime(timestamp) {
	        let str = '';
	        const d = Math.floor(timestamp / 86400);
	        if (d !== 0 || str.length > 0) str += d + '天';
	        const h = Math.floor(timestamp / 3600) % 24;
	        if (h !== 0 || str.length > 0) str += String(h).padStart(2, '0') + '时';
	        const m = Math.floor(timestamp / 60) % 60;
	        if (m !== 0 || str.length > 0) str += String(m).padStart(2, '0') + '分';
	        const s = Math.floor(timestamp) % 60;
	        str += String(s).padStart(2, '0') + '秒';
	        return str;
	    }

	    function initialPaint() {
	        vscode.postMessage({type: 'request-paintboard', data: 0});
	    }

	    function connectWs() {
	        let ws;
	        try { ws = new WebSocket('wss://ws.luogu.com.cn/ws'); }
	        catch (e) { vscode.postMessage({type: 'error', message: '无法连接追踪服务器'}); return; }
	        ws.onopen = function() {
	            ws.send(JSON.stringify({type: 'join_channel', channel: 'paintboard', channel_param: ''}));
	        };
	        ws.onmessage = function(event) {
	            const data = JSON.parse(event.data);
	            if (data.type === 'paintboard_update') update(data.y, data.x, colorlist[data.color]);
	            else if (data.type === 'result') { initialPaint(); console.log('Init.'); }
	        };
	    }

	    connectWs();

	    // Activity timer
	    const timeleftEl = document.getElementById('timeleft');
	    const countBeforeStart = activityStartTime > (Date.now() / 1000);
	    const clock = setInterval(function() {
	        const time = Math.floor(Date.now() / 1000);
	        if (countBeforeStart && time > activityStartTime) { clearInterval(clock); location.reload(); }
	        else if (time <= activityStartTime) timeleftEl.textContent = getFormattedTime(activityStartTime - time) + '后开始';
	        else if (time <= activityEndTime) timeleftEl.textContent = getFormattedTime(activityEndTime - time) + '后结束';
	        else { timeleftEl.textContent = '活动已结束'; clearInterval(clock); }
	    }, 1000);

	    // Init
	    document.addEventListener('DOMContentLoaded', function() {
	        console.log('Initing...');
	        window.addEventListener('message', function(event) {
	            if (event.data.type === 'init') {
	                for (let i = 0; i < H; i++)
	                    for (let j = 0; j < W; j++)
                        update(i, j, colorlist[parseInt(event.data.board[j * (H + 1) + i], 32)]);
                }
            });
        });

        initpale();
        render(myarr);
    </script>
    </body>
    </html>
    `;
  }
});
