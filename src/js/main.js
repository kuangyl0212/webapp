/**
 * 通知条
 * 点击“ X 不再提醒”后，刷新页面不再出现
 */
;(function(){

})()

/**
 * 轮播
 * 三张轮播图轮播效果： 实现每 5s 切换图片，图片循环播放；鼠标悬停某张图片，则暂停切换；
 * 切换效果使用入场图片 500ms 淡入的方式。
 * 点击后新开窗口打开目的页面，对应的跳转链接如下，
 * banner1： http://open.163.com/
 * banner2： http://study.163.com/
 * banner3： http://www.icourse163.org/
 */
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
  	this.pointers = this.dom.getElementsByClassName('pointer')[0];
  	//接受datasetting方式的外部设置
  	this.userSetting = JSON.parse(dom.getAttribute('data-setting'));
  	this.imgContainer.addEventListener('click',this.openLink);
  }
  //在在原型上绑定共有属性
  Slider.prototype = {
  	index : 0, //用来保存当前显示的图片序号
  	defaultSetting : {
    	speed:5000,
    	img:["src/img/slider/1.jpg","src/img/slider/2.jpg","src/img/slider/3.jpg","src/img/slider/4.jpg"],
    	links: ["http://open.163.com/","http://study.163.com/","http://www.icourse163.org/"],
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
  			a.addEventListener('click',this.pointerClickHandle);
  			this.pointers.appendChild(a);
  		}
  	},
  	//激活小圆点
  	activePointer: function(){
  		//检测是否激活
  		//先去掉原有激活
  		for (var i = 0; i < this.pointers.children.length; i++) {
  			this.pointers.children[i].classList.remove("active")
  		}
  		//添加active类
  		this.pointers.children[this.index].classList.add("active");
  	},
  	//setOffAutoPlay
  	setOffAutoPlay: function(){
  		clearInterval(this.interval1);
  	}
  }
  Slider.int = function(){
  	var doms = document.getElementsByClassName('m-slider');
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
  			a.pointers.children[i].addEventListener('click',function(){
  				var index = event.target.getAttribute('index');
  				a.setIndex(index);
  				a.showImg();
  			})
  		};
  		a.imgContainer.addEventListener('mouseover',function(){
  			a.setOffAutoPlay();
  		});
  		a.imgContainer.addEventListener('mouseout', function(){
  			a.autoPlay();
  		})
  		a.showImg();
  		a.autoPlay();
  	}
  }
  //注册slider类
  window['Slider'] = Slider;
})();

//初始化页面
window.onload = function(){
  Slider.int();
}
