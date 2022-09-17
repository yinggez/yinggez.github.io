var organ=[
    "脑子",
    "膀胱",
    "心脏",
    "肾",
     "大肠"
];
var adj=[
    "进水的",
    "有病的",
    "停止抽搐",
    "美丽有味道的",
    "尸体的"
];
var noun=[
    "傻子",
    "神经病",
    "人体老师",
     "手表",
     "会奔跑的尸体"
];
var a=organ[Math.floor(Math.random()*5)];
var b=adj[Math.floor(Math.random()*5)];
var c=noun[Math.floor(Math.random()*5)];
"你的"+a+"好像一个"+b+"的"+c;

var number=[3,2,1]
number.join(' is bigger than ')