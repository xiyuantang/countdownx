(function($){
	var CountDownx = function(options) {  
		this.defaultOptions = {
				'showCtxSelecter':'#showCtx1',
				'endTimestamp':1451007575111, // 毫秒数
				'endText':'活动结束',
				'clockText':'{dd}天{hh}时{mm}分{ss}秒',
				'endcallFunc':function(currObj,countDownx){}
		};
		
		this.options = {};
		this.empty = function(data){
			if(typeof data=="undefined"||data==null||data==''){
				return true;
			}
			return false;
		};
		
		this.formatTime = function (i){    
			   if (i < 10) {    
			       i = "0" + i;    
			   }    
			   return i;    
		};
		
		//渲染显示文本
		this.renderText = function(clockText,ts,thisTemp){
			var dd = parseInt(ts / 1000 / 60 / 60 / 24, 10); // 计算剩余的天数  
			var hh = parseInt(ts / 1000 / 60 / 60 % 24, 10); // 计算剩余的小时数  
			var mm = parseInt(ts / 1000 / 60 % 60, 10); // 计算剩余的分钟数  
			var ss = parseInt(ts / 1000 % 60, 10); // 计算剩余的秒数
			if(clockText.indexOf('{dd}')!==-1){
				dd = thisTemp.formatTime(dd);
				hh = thisTemp.formatTime(hh);
				mm = thisTemp.formatTime(mm);
				ss = thisTemp.formatTime(ss);
				clockText = clockText.replace('{dd}',dd).replace('{hh}',hh).replace('{mm}',mm).replace('{ss}',ss);
			}
			else if(clockText.indexOf('{hh}')!==-1){
				hh = hh + dd*24;
				hh = thisTemp.formatTime(hh);
				mm = thisTemp.formatTime(mm);
				ss = thisTemp.formatTime(ss);
				clockText = clockText.replace('{hh}',hh).replace('{mm}',mm).replace('{ss}',ss);
			}
			else if(clockText.indexOf('{mm}')!==-1){
				mm = mm + dd*24*3600 + hh*3600;
				mm = thisTemp.formatTime(mm);
				ss = thisTemp.formatTime(ss);
				clockText = clockText.replace('{mm}',mm).replace('{ss}',ss);
			}
			else if(clockText.indexOf('{ss}')!==-1){
				ts = ts/1000;
				ss = thisTemp.formatTime(ss);
				clockText = clockText.replace('{ss}',ss);
			}
			return clockText;
		};
		
		//---------------使用setInterval管理倒计时--------------
		//定时器
		this.setIntervalHandler = null;
		this.setIntervalFunc = function(thisTemp){
			var nowTimestamp = new Date().getTime();
			if(nowTimestamp < thisTemp.options['endTimestamp'] - 1000){
				var ts = thisTemp.options['endTimestamp'] - nowTimestamp; // 计算剩余的毫秒数
				var clockText = thisTemp.options['clockText'];
				clockText = thisTemp.renderText(clockText,ts,thisTemp);
				$(thisTemp.options['showCtxSelecter']).html(clockText);
			}
			else{
				clearInterval(thisTemp.setIntervalHandler);
				$(thisTemp.options['showCtxSelecter']).html(thisTemp.options['endText']);
				if(typeof options['endcallFunc']!='undefined'){
					options['endcallFunc'](thisTemp.options['showCtxSelecter'],thisTemp);
				}
			}
		};
		
		// 使用这个在渲染界面的时候，可能会出问题
		this.startBySetInterval = function(){
			var thisTemp = this;
			thisTemp.setIntervalHandler = setInterval(function() {
				thisTemp.setIntervalFunc(thisTemp);
			},1000);
			return this;
		};
		
		//---------------使用setTimeout管理倒计时--------------
		//定时器
		this.setTimeoutHandler = null;
		this.setTimeoutFunc = function(thisTemp){
			clearTimeout(thisTemp.setTimeoutHandler);
			var nowTimestamp = new Date().getTime();
			if(nowTimestamp < thisTemp.options['endTimestamp'] - 1000){
				var ts = thisTemp.options['endTimestamp'] - nowTimestamp; // 计算剩余的毫秒数
				var clockText = thisTemp.options['clockText'];
				clockText = thisTemp.renderText(clockText,ts,thisTemp);
				$(thisTemp.options['showCtxSelecter']).html(clockText);
				thisTemp.setTimeoutHandler = setTimeout(function() {
					thisTemp.setTimeoutFunc(thisTemp);
				},1000);
			}
			else{
				$(thisTemp.options['showCtxSelecter']).html(thisTemp.options['endText']);
				if(typeof options['endcallFunc']!='undefined'){
					options['endcallFunc'](thisTemp.options['showCtxSelecter'],thisTemp);
				}
			}
		};
		// 使用这个在秒数的计算上，可能会不准
		this.startBySetTimeout = function(){
			var thisTemp = this;
			thisTemp.setTimeoutFunc(thisTemp);
			return this;
		};
		
		//---------------使用一个setTimeout管理倒计时--------------
		//使用一个定时器，管理所有的倒计时
		this.timeoutSingleHandler = null;
		this.timeoutSingleFunc = function(){
			var thisTemp = this;
			clearTimeout(thisTemp.timeoutSingleHandler);
			var nowTimestamp = new Date().getTime();
			$(thisTemp.options['showCtxSelecter']).each(function() { 
				var objTemp = this;
				var endTimestamp = $(objTemp).attr('data-endtimestamp');
				if(!thisTemp.empty(endTimestamp)){
					endTimestamp = parseInt(endTimestamp);
				}
				else{
					return true;
				}
				if(nowTimestamp < endTimestamp - 1000){
					var ts = endTimestamp - nowTimestamp; // 计算剩余的毫秒数
					var clockText = thisTemp.options['clockText'];
					clockText = thisTemp.renderText(clockText,ts,thisTemp);
					$(objTemp).html(clockText);
				}
				else{
					var isSetEnd = $(objTemp).attr('data-isEnd');
					if(isSetEnd){
						return true;
					}
					else{
						$(objTemp).attr('data-isEnd',true);
						$(objTemp).html(thisTemp.options['endText']);
						if(typeof options['endcallFunc']!='undefined'){
							options['endcallFunc'](objTemp,thisTemp);
						}	
					}
				}
			});
			thisTemp.timeoutSingleHandler = setTimeout(function() {
				thisTemp.timeoutSingleFunc(thisTemp);
			},1000);
		};
		
		this.startTimeoutSingle = function(){
			var thisTemp = this;
			thisTemp.timeoutSingleFunc(thisTemp);
			return this;
		};
		
		// 配置选项
		this.initOptions = function(options){
			var showCtxSelecter = null;
			if(!this.empty(options['showCtxSelecter'])){
				showCtxSelecter = options['showCtxSelecter'];
			}
			if(!this.empty($(showCtxSelecter).attr('data-endtimestamp'))){
				options['endTimestamp'] = $(showCtxSelecter).attr('data-endtimestamp');
			}
			if(!this.empty(options['endTimestamp'])){
				options['endTimestamp'] = parseInt(options['endTimestamp']);
			}
			this.options = $.extend({},this.defaultOptions,options);	
		};
		this.initOptions(options);
			
	};
	
	$.extend({
		//单一定时器
		countDownSingleTimer: function(options) {
			var countDownx =  new CountDownx(options);
			countDownx.startTimeoutSingle();
			return countDownx;
		},
	});
	
	jQuery.fn.extend({
		//多定时器 - setInterval
		countDownMul: function(options) {
			return this.each(function() { 
				var countDownx = $(this).data('data-countdownx');
				if(countDownx){
					return true;
				}
				if(typeof options=="undefined"||options==null||options==''){
					options = {};	
				}
				//检查参数
				options['showCtxSelecter'] = this;
				
				//创建对象，绑定对象
				var countDownx = new CountDownx(options);
				$(this).data('data-countdownx',countDownx);
				countDownx.startBySetInterval();
			});
		},
		
		//多定时器 - setTimeout
		countDownMulx: function(options) {
			return this.each(function() { 
				if(typeof options=="undefined"||options==null||options==''){
					options = {};	
				}
				//检查参数
				options['showCtxSelecter'] = this;
				
				//创建对象，绑定对象
				var countDownx = new CountDownx(options);
				countDownx.startBySetTimeout();
			});
		}
	});
})(jQuery);