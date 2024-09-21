# whistle.vase 
> [请将 Whistle 升级到最新版本](https://wproxy.org/whistle/update.html)

vase 内置[default](#default)、[doT](#dot)、[dust](#dust)、[ejs](#ejs)、[handlebars](#handlebars)、[mock](#mock)、[mustache](#mustache)、[nunjucks](#nunjucks)、[vm](#vm)及用于解析自定义脚本的[script](#script)等渲染引擎，通过该[whistle](https://github.com/avwo/whistle#whistle)插件，可以通过模板结合相应的引擎mock开发过程中需要的json、html、图片等数据，也可以通过[script](#script)来自定义脚本更加灵活的获取模板及数据，控制输出等（如果只是静态数据不需要借助模板引擎批量生成，直接利用[whistle](https://github.com/avwo/whistle)的 `file` 或 `xfile` 即可实现）。

# 安装
### 安装whistle
请参考：[https://github.com/avwo/whistle#whistle](https://github.com/avwo/whistle#whistle)

### 安装插件whistle.vase
安装启动[whistle](https://github.com/avwo/whistle#whistle)后，直接通过npm来安装whistle插件：

	$ w2 install whistle.vase

**Note: 安装过程中的一些警告可以先忽略，如果要用到https、websocket需要[启用HTTPS](https://wproxy.org/whistle/webui/https.html)**
	
安装成功后在[whistle](https://github.com/avwo/whistle#whistle)的Plugins里面可以看到 `vase` 这个插件，并处于选中状态。

# 用法
### 配置界面
按上图操作打开vase的配置界面，也可以直接访问: [http://local.whistlejs.com/whistle.vase/](http://local.whistlejs.com/whistle.vase/)

![Usage](https://raw.githubusercontent.com/whistle-plugins/whistle.vase/master/src/img/usage.png)

### mock数据及获取数据
按上图，创建一个名称为`test-dust`、引擎名称为`dust`的的模板，内容如下：

![Usage](https://raw.githubusercontent.com/whistle-plugins/whistle.vase/master/src/img/create.png)

也支持通过本地文件加载模板 `pattern vase://tpl:AbsoluteLocalFilePath`，如：`www.test.com/path/to vase://mock:D:\test\demo.json` 或 `www.test.com/path/to vase://mock:/Users/av/test/demo.json`，方便把 mock 数据集成到项目文件里面，并通过 [w2 add](https://wproxy.org/whistle/cli.html) 自动配置项目的 mock 环境

在whistle配置：
	
	vase://test-dust /sina/ www.ifeng.com http://www.aliexpress.com/category/

![Usage](https://raw.githubusercontent.com/whistle-plugins/whistle.vase/master/src/img/whistle.png)

分别访问如下url：

1. [http://www.aliexpress.com/category/200003482/dresses.html?name=Aliexpress](http://www.aliexpress.com/category/200003482/dresses.html?name=Aliexpress)
2. [http://www.ifeng.com/?name=ifeng](http://www.ifeng.com/?name=ifeng)
3. [http://www.sina.com.cn/?name=sina](http://www.sina.com.cn/?name=sina)

即可分别看到：

	1. Hello Aliexpress
	2. Hello ifeng
	3. Hello sina

### 几点说明
1. 引擎用到的渲染数据默认先从接口提交的body中获取，如果没有对应的字段才从url的参数获取，如果要自定义数据可以通过vase的内置[script](#script)引擎来实现，具体参考下面的：[script](#script)
2. vase返回的数据的`content-type`默认都是 `text/html`，如果要修改`content-type`可以使用以下两种方式：

	- 在模板名称中加对应的后缀，如 `test-dust.txt`，vase会根据后缀生成对应的`content-type`
	- 通过[script](#script)引擎修改响应头部，具体参考下面的：[script](#script)
	
3. 如果要更加灵活的获取数据源、控制输出，如：通过本地文件或线上url获取模板内容、渲染数据，控制速度，分段输出，设置响应头、响应状态码、响应内容编码等，可以使用下面的：[script](#script)
4. websocket 请求比较特殊，请用 [whistle.script](https://github.com/whistle-plugins/whistle.script) 模拟请求响应


# 模板引擎

### default
默认引擎，即直接输出设置的文本，不做任何加工。

### doT
模板渲染引擎，使用方法参考Github：[https://github.com/olado/doT](https://github.com/olado/doT)
### ejs
模板渲染引擎，使用方法参考Github：[https://github.com/mde/ejs](https://github.com/mde/ejs)

### handlebars
模板渲染引擎，使用方法参考Github：[https://github.com/wycats/handlebars.js](https://github.com/wycats/handlebars.js)

### mock
模板渲染引擎，使用方法参考Github：[https://github.com/nuysoft/Mock](https://github.com/nuysoft/Mock)

### mustache
模板渲染引擎，使用方法参考Github：[https://github.com/janl/mustache.js](https://github.com/janl/mustache.js)

### nunjucks
模板渲染引擎，使用方法参考Github：[https://github.com/mozilla/nunjucks](https://github.com/mozilla/nunjucks)

### vm
模板渲染引擎，使用方法参考Github：[http://git.shepherdwind.com/velocity.js](http://git.shepherdwind.com/velocity.js)

### script
[script](#script-api)是vase系统自定义的脚本解析器，保留了JavaScript的一些基本特性，如：基本类型、条件语句、循环体、方法等，剔除了JavaScript内置的一些api，如：process、setTimeout、setInterval等，并内置了一些方法用于读取及处理vase的模板、本地文件、线上文件等，且所有调用都是同步的方式，具体用法参加下面的文档。


# script API

1. [out](#outdata-delay-speed): 所有的数据都要通过该方法才能输出到响应中，也可以用 `write`
2. [status](#statuscode): 设置输出的http状态码，默认为`200`，也可以写成 `statusCode(code)`
3. [header](#headername-value): 设置响应头
4. [headers](#headersobj): 批量设置响应头
5. [type](#typename): 快捷设置响应头 `content-type`
6. [file](#filepath): 读取本地文件
7. [get](#geturloptions): 通过get方式获取线上文件，支持https及http协议
8. [post](#posturloptions): 通过post方式获取线上文件，支持https及http协议
9. [request](#requestoptions): 通过自定义方式获取线上文件，支持https及http协议
10. [json](#jsondata): 将线上或本地文件、或字符串解析成json对象
11. [merge](#mergejson--jsonn): 合并json对象
12. [random](#randomarg1--argn): 随机输出
13. [join](#joinarr-seperator): 合并字符串
14. [req](#req对象): 用户请求对象
15. [render](#rendertpl-locals-enginetype): 渲染模板

详细用法请参考如下：

### out(data, delay, speed)
所有的数据都要通过该方法才能输出到响应中，也可以用 `write(data, delay, speed)`

data: 表示要输出的数据或数据源

1. 输出json对象

		out({
			test: 'hehe'
		});
	
2. 输出文本数据

		out('Hello world');

3. 输出vase加载的资源，详见下面个API文档

delay: 设置延迟多少毫秒输出

speed: 设置输出的速度kbs

### status(code)
设置输出的http状态码，默认为`200`，也可以写成 `statusCode(code)`

	out(status(500));

### header(name, value)
设置响应头

	out(header('content-type', 'text/plain; charset=utf8'));
	out(header('x-test', 'abc'));

### headers(obj)
设置响应头

	out(headers({
		'content-type': 'text/plain; charset=utf8',
		'x-test': 'abc'
	}));

### type(name)
设置响应头 `content-type`
``` js
out(type('sse'));
out(type('js'));
out(type('text/custom; charset=utf8'));
out(type('txt; charset=utf8'));
```

### file(path)
读取本地文件

	out(file('/User/xxx/test.html'));
	//windows
	//out(file('D:/xxx/test.html'));

### get(url|options)
通过get方式获取线上文件，支持https及http协议

	out(get('https://www.taobao.com/'));

自定义请求头部

	out(get({
		url: 'https://www.taobao.com/',
		headers: {
			'User-Agent': 'vase/x.y.z'
		}
	}));

### post(url|options)
通过post方式获取线上文件，支持https及http协议

	//返回空
	out(post('http://www.qq.com/'));

自定义请求头

	out(get({
		url: 'https://www.taobao.com/',
		headers: {
			'User-Agent': 'vase/x.y.z'
		}
	}));

自定义表单数据

	out(get({
		url: 'https://www.taobao.com/',
		headers: {
			'User-Agent': 'vase/x.y.z'
		}, 
		query: {key:'value'}
	}));


关于post的更多功能请参考：[https://github.com/axios/axios#request-config](https://github.com/axios/axios#request-config)

### request(options)
通过自定义方式获取线上文件，支持https及http协议
	//返回空
	out(request({
  		url: 'http://www.qq.com/',
  		method: 'post',
  		headers: {
    		'User-Agent': 'vase/x.y.z'
  		}, 
  		params: {key:'value'}
	}));
	
	//返回qq官网首页
	out(request({
		url: 'http://www.qq.com/',
		method: 'get',
		headers: {
			'User-Agent': 'vase/x.y.z'
		}
	}));

关于request的更多功能请参考：[https://github.com/axios/axios#request-config](https://github.com/axios/axios#request-config)

### json(data)
1. 将文本转换为json对象

	out(json('{"test": 123}'));
	
2. 从线上获取（支持jsonp请求）

	out(get('https://raw.githubusercontent.com/avwo/whistle/master/package.json'));
	
3. 从本地文件加载

	out(file('/User/xxx/test.txt'));


### merge(json, ..., jsonN)
合并json

	out(merge(json('{"test": 123}'), json(get('https://raw.githubusercontent.com/avwo/whistle/master/package.json')));

深度合并(>= v1.3.1)：
``` txt
out(merge(true, json('{"test": 123}'), json(get('https://raw.githubusercontent.com/avwo/whistle/master/package.json')));
```

### random(arg1, ..., argN)
数据获取参数列表中的一个

	out(random(json('{"test": 123}'), json(get('https://raw.githubusercontent.com/avwo/whistle/master/package.json'), 'test', file('/User/xxx/test.html')));

### join(arr, seperator)
与数组的`join`方法一样，拼接数组， `seperator`默认为`''`

	out(join([json('{"test": 123}'), json(get('https://raw.githubusercontent.com/avwo/whistle/master/package.json')), 'test', file('/User/xxx/test.html')]));

如果使用默认的separator(`''`)，也可以写成这样 `join(arg1, ..., argN)`

	out(join(json('{"test": 123}'), json(get('https://raw.githubusercontent.com/avwo/whistle/master/package.json')), 'test', file('/User/xxx/test.html')));



### req对象

请求对象，包含：headers、method、body、query、url、locals(=merge(req.query, req.body))

	out(req);

### render(tpl[, locals[, engineType]])

渲染模板

tpl：vase的模板名称或模板字符串

locals：可选，用于渲染的json对象

engineType：可选，渲染引擎名称，包含 [default](#default)、[doT](#dot)、[dust](#dust)、[doT](#dot)、[ejs](#ejs)、[mock](#mock)、[mustache](#mustache)、[nunjucks](#nunjucks)、[vm](#vm)

1. 如果tpl是字符串或数字，且vase里面有对应名称的模板，则会自动加载vase的模板内容

		out(render('test-dust'), req.locals);
		
		//修改locals
		out(render('test-dust', json(get('https://raw.githubusercontent.com/avwo/whistle/master/package.json'))));
		
		//切换engine
		out(render('test-dust', json(get('https://raw.githubusercontent.com/avwo/whistle/master/package.json')), 'handlebars'));
	
2. 如果tpl是字符串或数字，且没有对应的vase模板，则这些字符串作为模板内容

		out(render('Hello {{name}}', json(get('https://raw.githubusercontent.com/avwo/whistle/master/package.json')), 'handlebars'));
	
3. 渲染线上模板

		out(render(get('http://www.qq.com/'), json(get('https://raw.githubusercontent.com/avwo/whistle/master/package.json')), 'handlebars'));

4. 渲染本地文件模板

		out(render(file('/User/xxx/test.txt'), json(get('https://raw.githubusercontent.com/avwo/whistle/master/package.json')), 'handlebars'));
	



# script使用例子

### 模拟bigpipe

	out(join(render('test-doT', json(get('https://raw.githubusercontent.com/whistle-plugins/whistle.vase/master/package.json'))), '<br>'));
	out(join(render('test-default'), '<br>'), 1000);
	out(join(render('test-doT', {name: 'doT'}), '<br>'), 1000);
	out(join(render('test-dust', {name: 'dust'}), '<br>'), 1000);
	out(join(render('test-ejs', {name: 'ejs'}), '<br>'), 1000);
	out(join(render('test-handlebars', {name: 'handlebars'}), '<br>'), 1000);
	out(join(render('test-mock', {name: 'mock'}), '<br>'), 1000);
	out(join(render('test-mustache', {name: 'mustache'}), '<br>'), 1000);
	out(join(render('test-nunjucks', {name: 'nunjucks'}), '<br>'), 1000);
	out(render('test-vm', {name: 'vm'}));

`text-xxx`表示在vase上配置的模板
	
#### 随机输出

	out(random(render('test-default'), render('test-doT', {name: 'doT'}), render('test-dust', {name: 'dust'})));

### 结合上述两种情况

	for (var i = 0; i < 10; i++) {
		out(join(random(render('test-default'), render('test-doT', {name: 'doT'}), render('test-dust', {name: 'dust'})), '<br>'), 1000);
	}

