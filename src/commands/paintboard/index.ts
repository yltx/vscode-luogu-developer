import SuperCommand from '../SuperCommand'
import * as vscode from 'vscode'
import axios from '@/utils/api'

export default new SuperCommand({
  onCommand: 'paintboard',
  handle: async () => {
    const panel = vscode.window.createWebviewPanel(``,`冬日绘板`,vscode.ViewColumn.One, {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.file(exports.resourcesPath.value)]
    })
	panel.webview.onDidReceiveMessage(async message =>{
		console.log(`Got ${message.type} request.`)
		const paintboard = await axios.get("https://www.luogu.com.cn/paintboard/board").then(data => data?.data)
		panel.webview.postMessage({
			type: 'init',
			board: paintboard
		})
	})
    panel.webview.html = `
    <!doctype html>
	<html class="no-js">
	<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="description" content="">
	<meta name="keywords" content="">
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1 user-scalable=no">
	<title>冬日绘版 - 洛谷</title>
	<link rel="stylesheet" href="https://cdn.luogu.com.cn/css/amazeui.min.css">
	<style>
	        .about {
	            background: #fff;
	            padding: 40px 0;
	            color: #7f8c8d;
	        }

	        .about-color {
	            color: #34495e;
	        }

	        .about-title {
	            font-size: 180%;
	            padding: 30px 0 50px 0;
	            text-align: center;
	        }

	        .footer p {
	            color: #7f8c8d;
	            margin: 0;
	            padding: 15px 0;
	            text-align: center;
	            background: #2d3e50;
	        }

	        .paleitem {
	            margin: 5px;
	            width: 20px;
	            height: 20px;
	            border-radius: 3px;
	            background: #66ccff;
	            display: inline-block;
	            cursor: pointer;
	        }

	        #palette {
	            padding: 10px;
	            background: #7f7f7f;
	            margin: 10px;
	            width: 500px;
	            color: #fff;
	        }

	        .selected {
	            border: #DAA520 3px solid;
	        }

	        #canvas-box {
	            width: 1000px;
	            height: 630px;
	            padding: 0;
	            overflow: auto;
	        }
	    </style>
	</head>
	<body>
	<header class="am-topbar am-topbar-fixed-top">
	<div class="am-container">
	<h1 class="am-topbar-brand">
	<a href="#">洛谷冬日绘版</a>
	</h1>
	</div>
	</header>
	<div class="about">
	<div class="am-g am-container">
	<div class="am-u-lg-12">
	<div class="am-g">
	<div class="am-u-lg-11" id="canvas-box">
	<canvas width=5000 height=3000 id='mycanvas'>
	</canvas>
	</div>
	<div class="am-u-lg-5" id='zoom-tool'>
	<p style="">
	<span id='timeleft' class="am-badge am-badge-secondary"></span>
	</p>
	<button type="button" class="am-btn am-btn-primary am-radius" zoom=1>全部显示</button>
	<button type="button" class="am-btn am-btn-secondary am-radius" zoom=5>放大5x</button>
	<button type="button" class="am-btn am-btn-success am-radius" zoom=10>放大10x</button>
	</div>
	</div>
	</div>
	</div>
	</div>
	<!--[if (gte IE 9)|!(IE)]><!-->
	<script src="https://cdn.bootcss.com/jquery/3.2.1/jquery.min.js"></script>
	<script src="https://cdn.bootcss.com/jqueryui/1.12.1/jquery-ui.min.js"></script>
	<!--<![endif]-->
	<!--[if lte IE 8 ]>
	<script src="https://libs.baidu.com/jquery/1.11.3/jquery.min.js"></script>
	<script src="https://cdn.staticfile.org/modernizr/2.8.3/modernizr.js"></script>
	<script src="assets/js/amazeui.ie8polyfill.min.js"></script>
	<![endif]-->
	<script>
		const vscode = acquireVsCodeApi();

	    String.prototype.padStart = function padStart(maxLength, fillString) {
	        var str = String(this);
	        var fillStr = fillString === undefined ? ' ' : String(fillString);
	        if (maxLength <= str.length) return str;
	        var fillLength = maxLength - str.length;
	        var filler = '';
	        while (filler.length < fillLength) filler += fillStr;
	        return filler + str
	    }

	    H = 600;
	    W = 1000;
	    nowcolor = 0;
	    scale = 5;
	    dragged = 0;
	    activityStartTime = 1640966400;
	    activityEndTime = 1641225600;
	    colorlist = ['rgb(0, 0, 0)', 'rgb(255, 255, 255)', 'rgb(170, 170, 170)', 'rgb(85, 85, 85)', 'rgb(254, 211, 199)', 'rgb(255, 196, 206)', 'rgb(250, 172, 142)', 'rgb(255, 139, 131)', 'rgb(244, 67, 54)', 'rgb(233, 30, 99)', 'rgb(226, 102, 158)', 'rgb(156, 39, 176)', 'rgb(103, 58, 183)', 'rgb(63, 81, 181)', 'rgb(0, 70, 112)', 'rgb(5, 113, 151)', 'rgb(33, 150, 243)', 'rgb(0, 188, 212)', 'rgb(59, 229, 219)', 'rgb(151, 253, 220)', 'rgb(22, 115, 0)', 'rgb(55, 169, 60)', 'rgb(137, 230, 66)', 'rgb(215, 255, 7)', 'rgb(255, 246, 209)', 'rgb(248, 203, 140)', 'rgb(255, 235, 59)', 'rgb(255, 193, 7)', 'rgb(255, 152, 0)', 'rgb(255, 87, 34)', 'rgb(184, 63, 39)', 'rgb(121, 85, 72)'];
	    var myarr = [];
	    for (var i = 0; i < H; i++) {
	        myarr[i] = [];
	        for (var j = 0; j < W; j++) {
	            myarr[i][j] = '#dddddd';
	        }
	    }

	    function render(arr) {
	        var c = document.getElementById("mycanvas");
	        var ctx = c.getContext("2d");
	        for (var i = 0; i < H; i++) {
	            for (var j = 0; j < W; j++) {
	                ctx.fillStyle = arr[i][j];
	                ctx.fillRect(j * scale, i * scale, scale, scale);
	            }
	        }

	    }

	    function update(y, x, color) {
	        if (dragged) {
	            dragged = 0;
	            return;
	        }
	        //alert('ss');
	        var c = document.getElementById("mycanvas");
	        var ctx = c.getContext("2d");
	        ctx.fillStyle = color;
	        ctx.fillRect(x * 5, y * 5, 5, 5);
	    }

	    function initpale() {
	        $('#palette').html('');
	        colorlist.forEach(function (k, v) {
	            console.log(k, v);
	            $('#palette').append('<div class="paleitem" data-cid=' + v + '></div>');
	            $('[data-cid=' + v + ']').css('background', k);
	        });
	        zoom(1)
	    }

	    binditem = function () {
	        $('.paleitem').removeClass("selected");
	        $(this).addClass("selected");
	        nowcolor = $(this).attr('data-cid');
	    }
	    zoom = function (s) {
	        scale = s;
	        $('#mycanvas').width(1000 * scale)
	        if (s == 1) {
	            $('#mycanvas').css('top', 0);
	            $('#mycanvas').css('left', 0);
	        }
	    }
	    $("[zoom]").click(function () {
	        zoom($(this).attr('zoom'));
	    });
	    myarr[10][10] = '#6600ff';
	    myarr[100][200] = '#66ccff';
	    render(myarr);
	    initpale();
	    $('.paleitem').bind("click", binditem);
	    $('[data-cid=0]').addClass("selected");

	    $('#mycanvas').draggable({
	        cursor: "move",
	        stop: function () {
	            dragged = 1;
	        }
	    });
	    $('#mycanvas').bind("mousewheel", function (event, delta) {
	        event.preventDefault();
	        var delta = event.originalEvent.deltaY;
	        var y = parseInt(event.offsetY / scale);
	        var x = parseInt(event.offsetX / scale);
	        console.log(event);
	        if (delta > 0) {
	            if (scale == 10)
	                zoom(5);
	            else if (scale == 5)
	                zoom(1);
	        } else {
	            if (scale == 1)
	                zoom(5);
	            else if (scale == 5)
	                zoom(10);
	        }
	        if (scale != 1) {
	            $('#mycanvas').css('top', -y * scale + 300);
	            $('#mycanvas').css('left', -x * scale + 500);
	        }
	        scale
	        return false;
	    });

	    function getDateTime(timestamp, isRangeEnd) {
	        var d = new Date(timestamp * 1000);
	        var is2400 = false;
	        if (isRangeEnd && d.getHours() === 0 && d.getMinutes() === 0) {
	            d.setHours(-24)
	            is2400 = true;
	        }
	        var s = String(d.getFullYear()) + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + String(d.getDate()).padStart(2, '0') + ' ';
	        s += is2400 ? '24:00' : String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
            return s;
        }
      
        function getFormattedTime(timestamp) {
            var str = '';
            var d = Math.floor(timestamp / 86400);
            if (d !== 0 || str.length > 0) str += d + '天';
            var h = Math.floor(timestamp / 3600) % 24;
            if (h !== 0 || str.length > 0) str += String(h).padStart(2, '0') + '时';
            var m = Math.floor(timestamp / 60) % 60;
            if (m !== 0 || str.length > 0) str += String(m).padStart(2, '0') + '分';
            var s = Math.floor(timestamp) % 60;
            str += String(s).padStart(2, '0') + '秒';
            return str;
        }
      
        function initialPaint() {
            vscode.postMessage({type: 'request-paintboard',data: 0});
        }
      
        var ws = null;
        function connectWs() {
            try {
                ws = new WebSocket('wss://ws.luogu.com.cn/ws');
            } catch (e) {
                alert("无法连接追踪服务器");
                return;
            }
          
            ws.onopen = function() {
                var message = {
                    "type": "join_channel",
                    "channel": "paintboard",
                    "channel_param": ""
                };
                ws.send(JSON.stringify(message));
            };
          
            ws.onmessage = function (event) {
                var data = JSON.parse(event.data);
                if(data.type === "paintboard_update") {
                    update(data.y, data.x, colorlist[data.color]);
                } else if(data.type === "result") {
                    initialPaint()
					console.log('Init.')
                }
            };
        }
      
        connectWs();
      
        (function () {
            $('#activity-time-start').html(getDateTime(activityStartTime, false));
            $('#activity-time-end').html(getDateTime(activityEndTime, true));
            var countBeforeStart = activityStartTime > (new Date().getTime() / 1000);
            var $$ = $('#timeleft');
            var clock = setInterval(function () {
                var time = Math.floor(new Date().getTime() / 1000);
                if (countBeforeStart && (time > activityStartTime)) {
                    clearInterval(clock);
                    window.location.reload();
                } else if (time <= activityStartTime) {
                    $$.html(getFormattedTime(activityStartTime - time) + '后开始');
                } else if (time <= activityEndTime) {
                    $$.html(getFormattedTime(activityEndTime - time) + '后结束');
                } else {
                    $$.html('活动已结束');
                }
            }, 1000);
        })();

		$(document).ready(function () {
			console.log('Initing...');
			window.addEventListener('message', event => {
		  		if (event.data.type === 'init') {
					for (var i = 0; i < H; i++)
					for (var j = 0; j < W; j++)update(i,j,colorlist[parseInt(event.data.board[j*(H+1)+i], 32)])
		  		}
			});
		});
    </script>
    </body>
    </html>
    `
  }
})