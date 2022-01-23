import { searchTrainingdetail } from './api'
import md from './markdown'
export const showTrainDetails = async (id:any) => {
  const data = await searchTrainingdetail(id)
  console.log(data)
  return ``
}
/*
canEdit:false
privilegedTeams:(5) [{…}, {…}, {…}, {…}, {…}]
training:{description: '千里之行，始于足下。程序设计虽然花样繁多，但还是要从最简单的地方开始学习，由浅入深，…png)](http://ipic.luogu.com.cn/l/rma.html)', problems: Array(14), userScore: {…}, createTime: 1583016195, deadline: null, …}
createTime:1583016195
deadline:null
description:'千里之行，始于足下。程序设计虽然花样繁多，但还是要从最简单的地方开始学习，由浅入深，直至掌握。毕竟任何复杂的工程代码都是由一行行简单的代码组成的。\n\n![](bilibili:BV1bv411p7U5?page=1)\n\n我们编写计算机程序，将一个任务分解成一条一条的语句，计算机会按照顺序一条一条的执行这些语句，这就是顺序结构程序设计。\n\n![](bilibili:BV1bv411p7U5?page=2)\n\n**以上题单的选题来自洛谷编写教材《深入浅出程序设计竞赛 - 基础篇》**，并带有详细的教程和讲解，点击下方的图片了解该图书详情。[【官方网店绝赞热卖中！】>>>](https://item.taobao.com/item.htm?id=637730514783)\n\n[![](https://cdn.luogu.com.cn/upload/image_hosting/njc7dlng.png)](https://item.taobao.com/item.htm?id=637730514783)\n\n更有 kkksc03 站长亲自讲授的交互课，配套《深入浅出》使用，亲自在课堂中编写程序，在动手的过程中学习。[【点击此处报名！】>>>](http://ipic.luogu.com.cn/l/rma.html)\n\n[![](https://ipic.luogu.com.cn/yugu21rm/banner_jiaohu.png)](http://ipic.luogu.com.cn/l/rma.html)'
id:100
markCount:8185
*/