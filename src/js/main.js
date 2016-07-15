//兼容补丁

var attachEventListener = (function(){
	if(document.addEventListener){
		return function(el,type,fn){
			if(el.length){
				for(var i=0;i<el.length;i++){
					attachEventListener(el[i],type,fn);
				}
			}else{
				el.addEventListener(type,fn,false);
			}
		};
	}else{
	return function(el,type,fn){
		if(el.length){
			for(var i=0;i<el.length;i++){
				attachEventListener(el[i],type,fn);
			}
		}else{
			el.attachEvent('on'+type,function(){
				return fn.call(el,window.event);
			});
		}
	};
	}
})()
function getCurrentStyle(node) {
    var style = null;
    if(window.getComputedStyle) {
        style = window.getComputedStyle(node, null);
    }else{
        style = node.currentStyle;
    }
    return style;
}

//ajax封装
function ajax(method, url, data, successfn) {
	var xhr = null;
	try {
		xhr = new XMLHttpRequest();
	} catch (e) {
		xhr = new ActiveXObject('Microsoft.XMLHTTP');
	}
	if (method == 'get' && data) {
		url += '?' + data;
	}
	xhr.open(method,url,true);
	if (method == 'get') {
		xhr.send();
	} else {
		xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
		xhr.send(data);
	}
	xhr.onreadystatechange = function() {
		if ( xhr.readyState == 4 ) {
			if ( (xhr.status >= 200 && xhr.status <300) || xhr.status === 304) {
				successfn && successfn(xhr.responseText); 
			} else {
				console.log('Err：' + xhr.status);
			}
		}
	}
} 

/**
 * 通知条
 * 点击“ X 不再提醒”后，刷新页面不再出现
 */
;(function(){
	//页面背景补丁
	function bgFix(){
		var dom = document.querySelector('.layoutFix');
		dom.style.backgroundPosition = '0 -36px';
	}
	//设置和检查cooki设置成外部函数，如果已经设置了不再显示，则不需要实例化noti类
	function checkCookie(){
		var cookies = document.cookie;
		var reg = new RegExp("(\\s|^)setNotiOff=1(;|$)");
		if(reg.test(cookies)){
			return true;
		}
		return false;
	};
	function Notify(){
		this.setContent('网易云课堂微专业，帮助你掌握专业技能，令你求职或加薪多一份独特优势！');
		this.closer = this.dom.querySelector(".closer");
	};
	Notify.prototype = {
		template : '<div class="closer">不再提醒</div>\
		<p>内容<a href="">立即查看&gt;</a></p>',
		setContent : function(str){
			var dom = document.createElement('div');
			dom.className = 'm-noti';
			dom.innerHTML = this.template;
			var p = dom.getElementsByTagName('p')[0];
			p.childNodes[0].nodeValue = str;
			this.dom = dom;
		},
		//点不再显示的时候设置cookie
		setCookie : function(){
			document.cookie=encodeURIComponent("setNotiOff") + "=" +
											encodeURIComponent("1");
		},
		show : function(){
			this.parentNode = document.querySelector('.container');
			this.siblingDom = this.parentNode.children[0];
			//在页面中添加noti节点(在siblingdom前面添加)
			this.parentNode.insertBefore(this.dom, this.siblingDom);
		},
		close : function(parentNode, node){
			//从页面中删除节点
			parentNode.removeChild(node);
			
		}
	};
	Notify.int = function(str){
		if (!checkCookie()){
			var a = new Notify(str);
			attachEventListener(a.closer, 'click', function(){
				a.close(a.parentNode, a.dom);
				bgFix();
				a.setCookie();
			})
			a.show();
		} else {
			bgFix();
		}
	};
	window['Notify'] = Notify;
})()

/**
 * 说明：
 * 轮播的设置通过修改html文档中的m-slider类节点的data-setting属性来修改
 * 可修改图片数量、链接地址、切换时间等
 * 过场动画只写了fadeIn,不可修改,过场时长可修改
 */
;(function(){
  function Slider(dom) {
  	//保存节点
  	this.dom = dom;
  	//保存图片节点
  	this.imgContainer = this.dom.getElementsByTagName('img')[0];
  	//保存圆点节点
  	this.pointers = this.dom.querySelector('.pointer');
  	//接受datasetting方式的外部设置
  	this.userSetting = JSON.parse(dom.getAttribute('data-setting'));
  	var imgContainer = this.imgContainer;
  	var openLink = this.openLink;
  	attachEventListener(imgContainer, 'click', openLink);
  };
  //在在原型上绑定共有属性
  Slider.prototype = {
  	index : 0, //用来保存当前显示的图片序号
  	defaultSetting : {
    	speed:5000,
    	img:["src/img/slider/1.jpg",
    		"src/img/slider/2.jpg",
    		"src/img/slider/3.jpg",
    		"src/img/slider/4.jpg"],
    	links: ["http://open.163.com/",
    		"http://study.163.com/",
    		"http://www.icourse163.org/"],
    	animation:"fadeIn",
    	animationDuration:500,
    },
    setting : {},
  	//一些帮助函数
  	_help : {
  		//用来拓展setting
  		extend : function(obj1, obj2){
  			for (x in obj2){
  				//忽略掉不可用的设置
	    		if (obj1.hasOwnProperty(x)){
	    			obj1[x] = obj2[x];
    		}
    	}
    	return obj1;
  		},
  		fadeIn: function(dom, speed){
				dom.style.opacity = 0;
				var opacity = 0;
				var step = 100*(speed/1000);
				var time = setInterval(function(){
					opacity += (1/step);
					dom.style.opacity = opacity;
					if(opacity >= 1){
						clearInterval(time);
					}
				},(speed/step));
  		}
  	},
  	getSetting : function(){
  		this.setting = this._help.extend(this.defaultSetting, this.userSetting);
  	},
  	//设置序号
  	setIndex: function(index){
  		this.index = index % this.setting.img.length;
  	},
  	//设置链接(把链接设置在图片容器的link属性上)
  	setLink: function(){
  		this.imgContainer.setAttribute('link',this.setting.links[this.index]);
  	},
  	openLink: function(){
  		var link = this.getAttribute('link');
  		window.open(link);
  	},
  	//播放图片
  	showImg: function(){
  		this.imgContainer.src = this.setting.img[this.index];
  		this._help.fadeIn(this.imgContainer,this.setting.animationDuration);
  		this.setLink();
  		this.activePointer();
  	},
  	//播放下一张
  	showNext: function(){
  		this.setIndex(this.index+1);
  		this.showImg();
  	},
  	//自动播放
  	autoPlay: function(){
  		var that = this;
  		this.interval1 = window.setInterval(function(){
  			that.showNext()
  		}, this.setting.speed)
  	},
  	//添加小圆点
  	addPointer: function(){
  		for (var i = 0; i < this.setting.img.length; i++) {
  			var a = document.createElement('i');
  			//给小圆点添加一个序号
  			a.setAttribute("index", i);
  			var pointerClickHandle = this.pointerClickHandle;
  			attachEventListener(a, 'click',pointerClickHandle);
  			this.pointers.appendChild(a);
  		}
  	},
  	//激活小圆点
  	activePointer: function(){
  		//检测是否激活
  		//先去掉原有激活
  		for (var i = 0; i < this.pointers.children.length; i++) {
  			this.pointers.children[i].className = '';
  		}
  		//添加active类
  		this.pointers.children[this.index].className = "active";
  	},
  	//setOffAutoPlay
  	setOffAutoPlay: function(){
  		clearInterval(this.interval1);
  	}
  };
  Slider.int = function(){
  	var doms = document.querySelectorAll('.m-slider');
  	var _this_ = this;
  	for (var i = 0; i < doms.length; i++) {
  		//生成slider
  		var a = new _this_(doms[i]);
  		//设置slider
  		a.getSetting();
  		//动态添加小圆点
  		a.addPointer();
  		//给小圆点绑定点击事件
  		for (var i = 0; i < a.pointers.children.length; i++) {
  			attachEventListener(a.pointers.children[i], 'click',function(event){
  				var target = event.target || event.srcElement;
  				var index = target.getAttribute('index');
  				a.setIndex(index);
  				a.showImg();
  			})
  		};
  		attachEventListener(a.imgContainer, 'mouseover',function(){
  			a.setOffAutoPlay();
  		});
  		attachEventListener(a.imgContainer, 'mouseout', function(){
  			a.autoPlay();
  		})
  		a.showImg();
  		a.autoPlay();
  	}
  };
  //注册slider类
  window['Slider'] = Slider;
})();

// 弹窗类
;(function(){
 //创建一个备胎父类
 function Pop(){};
 Pop.prototype = {
 	setParentNode : function(dom){
 		this.parentNode = dom;
 	},
 	cerateDom : function(className, content){
 		var dom = document.createElement('div');
 		dom.innerHTML = content;
 		this.dom = dom;
 		this.dom.className = className;
 	},
 	show : function(){
 		this.parentNode.appendChild(this.dom);
 		var pop = this.dom.children[0];
 		var body = document.querySelector('body');
 		body.style.overflowY = 'hidden';
 		if (/MSIE\s8.0/g.test(navigator.appVersion)){
 			pop.style.marginLeft = (-pop.clientWidth/2) + 'px';
 			pop.style.marginTop = (-pop.clientHeight/2) + 'px';
 		}
 	},
 	remove : function(){
 		this.parentNode.removeChild(this.dom);
 		var body = document.querySelector('body');
 		body.style.overflowY = '';
 	},
 };
 //弹窗视频类
 function PopVideo(){};
 PopVideo.prototype = new Pop();
 PopVideo.int = function(){
 	var trigger = document.querySelector('.introduce').getElementsByTagName('img')[0];
 	var pop = new PopVideo();
 	var content = '<div class="videoDiv">\
 		<h5>请观看下面的视频</h5>\
 		<video src="http://mov.bn.netease.com/open-movie/nos/mp4/2014/12/30/SADQ86F5S_shd.mp4" \
 		controls="controls" width="890px"></video>\
 		<div class="closer"></div>\
 		</div>';
 	pop.setParentNode(document.querySelector('.container'))
	pop.cerateDom('videoPlayer',content);
	var closer = pop.dom.querySelector('.closer');
	attachEventListener(trigger, 'click', function(){
		pop.show();
	})
	closer.onclick = function(){
		pop.remove();
	}
 };
 //弹窗登录组件
 function checkCookie(cookieStr){
 	var cookies = document.cookie;
	var reg = new RegExp("(\\s|^)" + cookieStr + "(;|$)");
	if(reg.test(cookies)){
		return true;
	}
	return false;
 }
 function PopLogin(){
 	this.setTrriger = function(){
 		var dom = document.querySelector('.follow');
 		dom.innerHTML = '<div class="button">关注</div>\
 			<span>粉丝</span>\
			<span>45</span>';
		this.trigger = dom.children[0];
 	}
 	this.setCookie = function(str){
 		document.cookie=encodeURIComponent(str) + "=" +
										encodeURIComponent("1");
	};
	this.login = function(username, password){
		var url = 'http://study.163.com/webDev/login.htm';
		var data = 'userName=' + username + '&password=' + password;
		var loginObj = this;
		var button = this.dom.querySelector('.submit');
		ajax('get', url,data,function(text){
			if (text == 0) {
				button.className = 'submit';
				button.disabled = '';
				button.style.cursor = 'pointer';
			}
			if(text == 1){
				loginObj.setCookie('loginSuc');
				loginObj.follow();
				loginObj.remove();
			}
		})
	}
	this.follow = function(){
		var dom = this.trigger.parentNode;
		dom.innerHTML = '<span class="spa">已关注</span>\n<span>|</span>\n<a href="#">取消</a>';
		dom.className = 'followed';
		this.setCookie('followSuc');
	}
 };
 PopLogin.prototype = new Pop();
 PopLogin.int = function(){
 	var dom = document.querySelector('.follow');
 	if(checkCookie('followSuc=1')){
 		dom.innerHTML = '<span class="spa">已关注</span>\n<span>|</span>\n<a href="#">取消</a>';
		dom.className = 'followed';
 	} else{
 		var pop = new PopLogin();
 		pop.setTrriger();
	 	var content = '<div class="formDiv">\
	 		<form action="">\
	 		<legend>登录网易云课堂</legend>\
	 		<input type="text" value="账号" class="username"><br>\
	 		<input type="text" value="密码" class="password"><br>\
	 		<input type="button" value="登录" class="submit">\
	 		<div class="closer"></div>\
	 		</form>\
	 		</div>';
	 	pop.cerateDom('m-login', content);
		pop.setParentNode(document.querySelector('.container'));
		var closer = pop.dom.querySelector('.closer');
		attachEventListener(pop.trigger, 'click', function(){
		 	if (!checkCookie('loginSuc=1')) {
				pop.show();
				closer.onclick = function(){
					pop.remove();
				}
				var usernameDom = pop.dom.querySelector('.username');
				var passwordDom = pop.dom.querySelector('.password');
				attachEventListener(usernameDom, 'focus',function(){
					if(this.value === '账号'){
						this.value = '';
					}
				})
				attachEventListener(usernameDom, 'focusout',function(){
					if(this.value === ''){
						this.value = '账号';
					}
				})
				attachEventListener(passwordDom,'focus',function(){
					if(this.value === "密码") {
						this.value = '';
						this.type = 'password';
					}
				})
				attachEventListener(passwordDom, 'focusout',function(){
					if(this.value === ''){
						this.type = 'text';
						this.value = '密码';
					}
				})
				var button = pop.dom.querySelector('.submit');
				attachEventListener(button, 'click', function(){
					this.disabled = 'disabled';
					this.style.cursor = 'default';
					this.className = 'submit disabled';
					pop.login(md5(usernameDom.value), md5(passwordDom.value));
				})
			}
		})
 	}
 };

 //注册
 window['PopVideo'] = PopVideo;
 window['PopLogin'] = PopLogin;
})()

//最热排行
;(function(){
	//创建一个简单队列类，实现先进先出
	function List(){}
	List.prototype = {
		setEles : function(arr){
			this.eles = arr;
		},
		refresh : function(arrEle){
			this.eles.push(arrEle);
			this.eles.shift();
		}
	}
	//创建热门排行类
	function HotList(){}
	HotList.prototype = {
		setList : function(){
			var list = new List();
			list.setEles(this.originData.slice(0, 10));
			this.list = list;
			this.nextIndex = 10;
		},
		refreshList : function(){
			var hotlist = this;
			var listO = this.list;
			var nextIndex = this.nextIndex;
			setInterval(function(){
				var nextEle = hotlist.originData[nextIndex]
				listO.refresh(nextEle);
				nextIndex = (nextIndex + 1) % 20;
				hotlist.renderDom();
			},5000)
		},
		renderDom : function(){
			var dom = document.querySelector('.rank').querySelector('ul');
			dom.innerHTML = '';
			for (var i = 0; i < this.list.eles.length; i++) {
				var li = document.createElement('li');
				li.innerHTML = '<img src=' + 
						this.list.eles[i].smallPhotoUrl + 
						' alt=""><h4>' + 
						this.list.eles[i].name + 
						'</h4><p>' + 
						this.list.eles[i].learnerCount  +'</p>';
				dom.appendChild(li);
			}
		},
		renderList : function(){
			//保存当前对象
			var list = this;
			ajax('get', 'http://study.163.com/webDev/hotcouresByCategory.htm', '', function(par){
					var data = JSON.parse(par)
					list.originData = data;
					list.setList();
					list.renderDom();
					list.refreshList();
			})
		},
	}
	window['HotList'] = HotList;
	HotList.int = function(){
		var list = new HotList();
		list.renderList();
	}
})()

//课程列表
;(function(){
	function Courses(){
		this.dom = document.querySelector('.m-courList').querySelector('.main');
		this.tabsDom = this.dom.querySelector('.tabs');
		this.turnerDom = this.dom.querySelector('.turner');
		this.listDom = this.dom.querySelector('.course');
		this.config = {
			url : 'http://study.163.com/webDev/couresByCategory.htm',
			postData : undefined, //get请求时的发送的参数
			type : 10,
			totalPage : undefined,
			currentPage : 1,
			psize : undefined,
		}
	}
	Courses.prototype = {
		setPostData : function(){
			this.config.postData = 'type=' + this.config.type + 
				'&pageNo=' + this.config.currentPage +
				'&psize=' + this.config.psize;
		},
		setPsize : function(){
			var _this_ = this;
			var body = document.querySelector('body');
			var set = function(){
				if (body.clientWidth > 1208) {
					_this_.config.psize = 20;
				} else {
					_this_.config.psize = 15;
				}
			}
			set();
			attachEventListener(window, 'resize',function(){
				set();
				_this_.setPostData()
				ajax('get',_this_.config.url,_this_.config.postData,function(text){
					var data = JSON.parse(text);
					_this_.renderList(data);
				})
			})
		},
		setType : function(type){
			this.config.type = type;
		},
		setTotalPage : function(count){
			this.config.totalPage = count;
		},
		setCurrentPage : function(page){
			this.config.currentPage = parseInt(page);
		},
		renderTabs : function(){
			var _this_ = this;
			var tabs = this.tabsDom.children;
			for (var i = 0; i < tabs.length; i++) {
				attachEventListener(tabs[i], 'click', function(event){
				var target = event.target || event.srcElement;
				_this_.setType(target.getAttribute('type'));
				for (var i = 0; i < tabs.length; i++) {
					tabs[i].className = 'tab';
				}
				target.className = 'tab active';
				ajax('get', _this_.config.url, 'pageNo=1&psize=' +
					_this_.config.psize + '&type='+ target.getAttribute('type'), function(text){
					var data = JSON.parse(text);
					_this_.renderList(data);
					_this_.renderTurner(data);
					_this_.setTotalPage(data.totalPage);
					_this_.setCurrentPage(1)
				})
			})
			}
		},
		//渲染课程列表
		renderList : function(data){
			var _this_ = this;
			this.listDom.innerHTML = '';
			for (var i = 0; i < data.list.length; i++) {
				var cell = document.createElement('div');
				cell.className = 'cell';
				cell.setAttribute('index',i);
				cell.innerHTML = '<img src=' + data.list[i].bigPhotoUrl + '>\
					<a href="#"><h4 class="tit">' + data.list[i].name +'</h4></a>\
					<p class="author">' + data.list[i].provider + '</p>\
					<p class="user">' + data.list[i].learnerCount + '</p>\
					<p class="price">￥' + data.list[i].price + '</p>';
				this.listDom.appendChild(cell);
				attachEventListener(cell,'mouseover',function(event){
					var cell = event.currentTarget || event.srcElement;
					var index = cell.getAttribute('index');
					var popContent = '<div class="upper">\
						<img src=' + data.list[index].bigPhotoUrl + '>\
						<h4 class="tit">' + data.list[index].name +'</h4>\
						<p class="user">' + data.list[index].learnerCount + '人在学</p>\
						<p class="author">发布者：' + data.list[index].provider + '</p>\
						<p class="category">分类：' + (data.list[index].categoryName || '未添加') + '</p>\
					</div>\
					<div class="description">' + data.list[index].description + '</div>';
					cell.myTimer = setTimeout(function(){
						var pop = document.createElement('div');
						pop.innerHTML= popContent;
						pop.className = 'pop'
						pop.style.cssText = 'left:' + (cell.offsetLeft-10) + 'px;top:' +
							(cell.offsetTop-10) + 'px;'
						attachEventListener(pop,'mouseleave',function(event){
							var dom = event.currentTarget || event.srcElement;
							dom.parentNode.removeChild(dom);
						})
						_this_.listDom.appendChild(pop);
					},500)
				})
				attachEventListener(cell,'mouseout',function(event){
					var cell = event.currentTarget || event.srcElement;
					clearTimeout(cell.myTimer);
				})	
			}
		},
		// 渲染翻页器
		renderTurner : function(data){
			var _this_ = this;
			//刷新课程列表
			var render = function(event){
				var target = event.target || event.srcElement || target;
				var parentNode = _this_.turnerDom.querySelector('ul');
				console.log(target)
				for (var i = 0; i < parentNode.children.length; i++) {
					parentNode.children[i].className = '';
				}
				_this_.setCurrentPage(target.innerHTML || target.pageno);
				_this_.setPostData()
				ajax('get',_this_.config.url,_this_.config.postData,function(text){
					var data = JSON.parse(text);
					_this_.renderList(data);
				})
				for (var i = 0; i < parentNode.children.length; i++) {
					if(parentNode.children[i].innerHTML == _this_.config.currentPage){
						parentNode.children[i].className = 'active'
					};
				}
			};
			//刷新翻页器
			var reTurner = function(event){
				var target = event.target || event.srcElement;
				var pageno = target.innerHTML || (_this_.config.currentPage - 1);
				if(pageno < (_this_.config.totalPage)){
						turnerUl.innerHTML = '';
						var span = document.createElement('span');
						span.innerHTML = '...';
						turnerUl.appendChild(span);
						for (var i = pageno - 8; i <= parseInt(pageno) + 1; i++) {
							var li = document.createElement('li');
							li.innerHTML = i;
							li.setAttribute('pageno', i);
							attachEventListener(li, 'click', function(event){
								render(event);
							});
							if (i == _this_.config.currentPage) {
								li.className = 'active'
							}
							turnerUl.appendChild(li);
						}
						if (!(turnerUl.lastChild.innerHTML == _this_.config.totalPage)) {
							var span = document.createElement('span');
							span.innerHTML = '...';
							turnerUl.appendChild(span);
						}
					}
					attachEventListener(turnerUl.children[10],'click',function(event){
						reTurner(event);
					});
					attachEventListener(turnerUl.children[1],'click',function(event){
						reverse(event);
					});
			}
			//反向刷新翻页器
			var reverse = function(event){
				var target = event.target || event.srcElement;
				var pageno = target.innerHTML || (_this_.config.currentPage + 1);
				turnerUl.innerHTML = '';
				if((pageno - 1) > 1){
					var span = document.createElement('span');
					span.innerHTML = '...';
					turnerUl.appendChild(span);
				}
				for (var i = pageno - 1; i <= parseInt(pageno) + 8; i++) {
					var li = document.createElement('li');
					li.innerHTML = i;
					li.setAttribute('pageno', i);
					attachEventListener(li, 'click', function(event){
						render(event)
					});
					if (i == _this_.config.currentPage) {
						li.className = 'active'
					}
					turnerUl.appendChild(li);
				}
				var span = document.createElement('span');
				span.innerHTML = '...';
				turnerUl.appendChild(span);
				var length = turnerUl.children.length;
				attachEventListener(turnerUl.children[(length-2)],'click',function(event){
					reTurner(event);
				});
				attachEventListener(turnerUl.children[1],'click', function(event){
					reverse(event);
				});
			}
			// 翻页器点击事件的处理函数
			function clickHandler(event){
				var target = event.target || event.srcElement;
				var pageno = target.innerHTML;
				if(pageno < 10) {
					render(event);
				} else {
					render(event);
					reTurner(event);
				}
			};
			// 下一页按钮的处理函数
			function nextHandler(event){
				if((_this_.config.currentPage + 1) <= _this_.config.totalPage){
					_this_.config.currentPage += 1;
					_this_.setPostData()
					ajax('get',_this_.config.url,_this_.config.postData,function(text){
						var data = JSON.parse(text);
						_this_.renderList(data);
					})
					//刷新翻页器
					var lis = turnerUl.querySelectorAll('li');
					var lim = turnerUl.querySelectorAll('li')[9].innerHTML;
					if (_this_.config.currentPage > lim) {
						reTurner(event);
					} else {
						for (var i = 0; i < lis.length; i++) {
							lis[i].className = ''
							if (lis[i].innerHTML == _this_.config.currentPage) {
								lis[i].className = 'active'
							}
						}
					}
				}
			};
			// 上一页的处理函数
			function lastHandler(event){
				if((_this_.config.currentPage - 1) >= 1){
					_this_.config.currentPage -= 1;
					_this_.setPostData()
					ajax('get',_this_.config.url,_this_.config.postData,function(text){
						var data = JSON.parse(text);
						_this_.renderList(data);
					})
					//刷新翻页器
					var lis = turnerUl.querySelectorAll('li');
					var lim = turnerUl.querySelector('li').innerHTML;
					if (_this_.config.currentPage < lim) {
						reverse(event);
					} else {
						for (var i = 0; i < lis.length; i++) {
							lis[i].className = ''
							if (lis[i].innerHTML == _this_.config.currentPage) {
								lis[i].className = 'active'
							}
						}
					}
				}
			}
			// 渲染翻页器的逻辑
			var totalPageCount = data.pagination.totlePageCount;
			var turnerUl = this.turnerDom.getElementsByTagName('ul')[0];
			turnerUl.innerHTML = '';
			if (totalPageCount <= 10) {
				for (var i =0;i < totalPageCount; i++){
					var li = document.createElement('li');
					li.innerHTML = i + 1;
					li.setAttribute('pageno', i + 1);
					attachEventListener(li, 'click', function(event){
						clickHandler(event);
					});
					turnerUl.appendChild(li);
				}
			} else {
				for (var i =0;i < 10; i++){
					var li = document.createElement('li');
					li.innerHTML = i + 1;
					li.setAttribute('pageno', i + 1);
					attachEventListener(li, 'click', function(event){
						clickHandler(event);
					});
					turnerUl.appendChild(li);
				};
				var span = document.createElement('span');
				span.innerHTML = '...';
				turnerUl.appendChild(span);
			}
			turnerUl.children[0].className = 'active';
			var next = _this_.turnerDom.querySelector('.next');
			var last = _this_.turnerDom.querySelector('.last');
			next.onclick = function(event){
				nextHandler(event);
			};
			last.onclick = function(event){
				lastHandler(event);
			};
		},
	}
	Courses.int = function(){
		var cour = new Courses();
		cour.setPsize();
		cour.setPostData();
		cour.renderTabs();
		//初次渲染
		ajax('get', cour.config.url, 'pageNo=1&psize=' +
			cour.config.psize + '&type=10', function(text){
			var data = JSON.parse(text);
			var totalPage = data.totalPage;
			cour.setTotalPage(totalPage);
			cour.renderList(data);
			cour.renderTurner(data);
		})
	}
	window['Courses'] = Courses;
})()

;(function(){
	// 修复布局
	function layoutFix(){
		var body = document.querySelector('body');
		var dom = document.querySelector('.layoutFix');
		var container = document.querySelector('.container');
		var img1 = document.querySelector('.m-slider').querySelector('.image');
		var img2 = document.querySelector('.workEnv').querySelector('.image');
		function fix(){
			var width = body.clientWidth;
			if(width > 960){
				// 修复ie8不支持transform产生的布局错误
				if (/MSIE\s8.0/g.test(navigator.appVersion)){
					container.style.width = '1208px';
					img2.style.marginLeft = (-(1616 - 1208)/2) + 'px';
					 img1.style.marginLeft = (-(1652 - 1208)/2) + 'px';
 				};
 				// 页面溢出的修复
				dom.style.width = width + 'px';
			} else {
				dom.style.width = '960px';
				if (/MSIE\s8.0/g.test(navigator.appVersion)){
					container.style.width = '960px';
					img1.style.marginLeft = (-(1652 - 960)/2) + 'px';
					img2.style.marginLeft = (-(1616 - 960)/2) + 'px';
				};
			}
		}
		fix();
		attachEventListener(window,'resize',fix)
	}
	var loadHandler = function(){
		Slider.int();
		Notify.int();
		PopVideo.int();
		PopLogin.int();
		HotList.int();
		Courses.int();
		layoutFix();
	}
	// ie8中使用window loaded时初始化js代码 其他浏览器用domready
	if (/MSIE\s8.0/g.test(navigator.appVersion)){
		attachEventListener(window,'load',loadHandler)
	} else{
		attachEventListener(document, "DOMContentLoaded", loadHandler)
	}
})()
