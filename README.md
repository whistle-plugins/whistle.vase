# whistle.vase 
vase插件内置[default](#default)、[doT](#dot)、[dust](#dust)、[doT](#dot)、[ejs](#ejs)、[jade](#jade)、[mock](#mock)、[mustache](#mustache)、[nunjucks](#nunjucks)、[swig](#mustache)、[vm](#vm)及用于解析自定义脚本的[script](#script)等渲染引擎，通过该[whistle](https://github.com/avwo/whistle#whistle)插件，可以通过模板结合相应的引擎mock开发过程中需要的json、html、图片等数据，也可以通过[script](#script)来自定义脚本更加灵活的获取模板及数据，控制输出等（如果只是静态数据不需要借助模板引擎批量生成，直接利用whistle的 `file` 或 `xfile` 即可实现）。

# 安装
### 安装whistle
首先，要安装v0.8.0及以上版本的[whistle](https://github.com/avwo/whistle#whistle)，如果你的机器已经安装了v0.8.0及以上版本的[whistle](https://github.com/avwo/whistle#whistle)可以忽略该步骤。

安装[whistle](https://github.com/avwo/whistle#whistle)，请参考：[https://github.com/avwo/whistle#whistle](https://github.com/avwo/whistle#whistle)

### 安装插件whistle.vase
安装启动[whistle](https://github.com/avwo/whistle#whistle)后，直接通过npm来安装whistle插件：

	$ npm install -g whistle.vase

如果是mac或linux系统，可能需要加sudo

	$ sudo npm install -g whistle.vase
	
安装成功后打开whistle的UI界面的About对话框，即可看到当前whistle安装的所有插件：

![Install](https://raw.githubusercontent.com/whistle-pugins/whistle.vase/master/htdocs/img/install.png)

# 用法
### 配置界面
按上图操作打开vase的配置界面，也可以直接访问: [http://vase.local.whistlejs.com/](http://vase.local.whistlejs.com/)

![Usage](https://raw.githubusercontent.com/whistle-pugins/whistle.vase/master/htdocs/img/usage.png)

### mock数据及获取数据
按上图，创建一个名称为`test-dust`、引擎名称为`dust`的的模板，内容如下：

![Usage](https://raw.githubusercontent.com/whistle-pugins/whistle.vase/master/htdocs/img/create.png)

在whistle配置：
	
	vase://test-dust /sina/ www.ifeng.com http://www.aliexpress.com/category/

![Usage](https://raw.githubusercontent.com/whistle-pugins/whistle.vase/master/htdocs/img/create.png)

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


# 模板引擎用

### default
默认引擎，即直接输出设置的文本，不做任何加工。

### doT
模板渲染引擎，使用方法参考Github：[https://github.com/olado/doT](https://github.com/olado/doT)

### dust
模板渲染引擎，使用方法参考Github：[https://github.com/linkedin/dustjs-helpers](https://github.com/linkedin/dustjs-helpers)

### ejs
模板渲染引擎，使用方法参考Github：[https://github.com/mde/ejs](https://github.com/mde/ejs)

### jade
模板渲染引擎，使用方法参考Github：[https://github.com/jadejs/jade](https://github.com/jadejs/jade)

### mock
模板渲染引擎，使用方法参考Github：[https://github.com/nuysoft/Mock](https://github.com/nuysoft/Mock)

### mustache
模板渲染引擎，使用方法参考Github：[https://github.com/janl/mustache.js](https://github.com/janl/mustache.js)

### handlebars
模板渲染引擎，使用方法参考Github：[https://github.com/wycats/handlebars.js](https://github.com/wycats/handlebars.js)

### nunjucks
模板渲染引擎，使用方法参考Github：[https://github.com/mozilla/nunjucks](https://github.com/mozilla/nunjucks)

### swig
模板渲染引擎，使用方法参考Github：[https://github.com/paularmstrong/swig](https://github.com/paularmstrong/swig)

### vm
模板渲染引擎，使用方法参考Github：[http://git.shepherdwind.com/velocity.js](http://git.shepherdwind.com/velocity.js)

### script
script是vase系统自定义的脚本解析器，保留了JavaScript的一些基本特性，如：基本类型、条件语句、循环体、方法等，剔除了JavaScript内置的一些api，如：process、setTimeout、setInterval等，并内置了一些方法用于读取及处理vase的模板、本地文件、线上文件等，且所有调用都是同步的方式，具体用法参加下面的文档。


# script API

### out(data, delay, speed)
所有的数据都要通过该方法才能输出到响应中.

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

#### headers(obj)
设置响应头

	out(headers({
		'content-type': 'text/plain; charset=utf8',
		'x-test': 'abc'
	}));
	
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
  		form: {key:'value'}
	}));


关于post的更多功能请参考：[https://github.com/request/request#forms](https://github.com/request/request#forms)

### request(options)
通过自定义方式获取线上文件，支持https及http协议
	//返回空
	out(request({
  		url: 'http://www.qq.com/',
  		method: 'post',
  		headers: {
    		'User-Agent': 'vase/x.y.z'
  		}, 
  		form: {key:'value'}
	}));
	
	//返回qq官网首页
	out(request({
  		url: 'http://www.qq.com/',
  		method: 'get',
  		headers: {
    		'User-Agent': 'vase/x.y.z'
  		}
	}));

关于request的更多功能请参考：[https://github.com/request/request#requestoptions-callback](https://github.com/request/request#requestoptions-callback)

### json(data)
1. 将文本转换为json对象

	out(json('{"test": 123}'));
	
2. 从线上获取

	out(get('https://raw.githubusercontent.com/avwo/whistle/master/package.json'));
	
3. 从本地文件加载

	out(file('/User/xxx/test.txt'));


### merge(json, ..., jsonN)
合并json

	out(merge(json('{"test": 123}'), json(get('https://raw.githubusercontent.com/avwo/whistle/master/package.json')));
	
### random(arg1, ..., argN)
数据获取参数列表中的一个

	out(random(json('{"test": 123}'), json(get('https://raw.githubusercontent.com/avwo/whistle/master/package.json'), 'test', file('/User/xxx/test.html')));
	
### join(arr, seperator)
与数组的`join`方法一样，拼接数组

	out(join([json('{"test": 123}'), json(get('https://raw.githubusercontent.com/avwo/whistle/master/package.json'), 'test', file('/User/xxx/test.html')]));
	
如果使用默认的separator(`,`)，也可以写成这样

	out(join(json('{"test": 123}'), json(get('https://raw.githubusercontent.com/avwo/whistle/master/package.json'), 'test', file('/User/xxx/test.html')));

	


1. out: 所有的数据都要通过该方法才能输出到响应中
2. write: 同out
3. status: 设置响应状态码
4. statusCode: 同status
5. header: 设置响应头部
6. headers: 批量设置响应头部
7. file: 读取本地文件
8. get: 通过get方式获取线上文件，支持https及http协议
9. post: 通过post方式获取线上文件，支持https及http协议
10. request: 通过自定义方式获取线上文件，支持https及http协议
11. json: 把文本转成json对象
12. merge: 合并json对象
13. random: 随机获取列表中的数据
14. join: 同数组的join方法
15. concat: 合并两个字符串
16. req: 请求对象，包含：headers、method、body、query、locals(=merge(req.query, req.body))
17. render: 指定渲染模板、数据、引擎类型渲染数据


# script使用例子

