# GomUI, Gom is Go Mobile!

[Gom的实践与实例]()
一个H5的项目MVC框架,包含丰富灵活配置的UI,  History Html5 SPA路由, Model等的封装
将实现WebApp HybridApp SPA MPA 多种方式的开发模式

<iframe src="https://ghbtns.com/github-btn.html?user=ccjoe&repo=gom&type=watch&count=true" frameborder="0" scrolling="0" width="160px" height="30px"></iframe>
<iframe src="https://ghbtns.com/github-btn.html?user=ccjoe&repo=gom&type=fork&count=true" frameborder="0" scrolling="0" width="160px" height="30px"></iframe>

项目地址： [https://github.com/ccjoe/gom](https://github.com/ccjoe/gom)  
示例地址： [https://github.com/ccjoe/gomapp](https://github.com/ccjoe/gomapp) [在线预览]()  
文档地址： [http://ccjoe.github.io/jsdoc/gom](http://ccjoe.github.io/jsdoc/gom) 或 [http://f2ee.com/jsdoc/gom](http://f2ee.com/jsdoc/gom)  


## 运行入口
```javascript
require(['App', 'config', 'route'], function(App, config, route){
    new App(config, route).run();
});
```

## APP Route 路由表相关配置(指向相应的视图与控制器)

每当路由到一个地址(即页面)，会有相应的`cro对象`(CurrentRoute Object)，最大化的cro如下：（最小化的仅tmpl与ctrl必须配置一项，根据实际情况）
```
{
    tmplname : 'sample'    //optional(tmpl与ctrl必须指定一个) 页面调用的模块名称 template
    ctrl : 'sample     //optional' 页面对应的ctrl的路径 ctrl
    title: 'SAMPLE'    //optional 页面标题
    data : {}          //optional 页面需要的数据（一般不会直接写入，由ajax动态写入）
    params: {}         //optional 页面间相互传递数据时设置此对象
    wrapper: '#sample' //optional 页面需要插入的DOM位置
    seo: {
        title:  'gom'   //上面title是显示在页面上的，这个设置是<title>标签里的值
        keyword: 'gom, gomUI',
        descption: '一个mobile H5 框架'
    }
}
```
+其中可以不指定`tmplname`与`ctrl`,但必须指定其一。因为显示一个页面可以由tmplname指向的文件或`ctrl指向的ctrl文件(amd引入)`单独或配合在一起去显示一个页面的逻辑。

+对象上有页面调用的视图，ctrl, 标题...,其中比较重要的是数据对象，绑定在`data`上, data可以为静态数据或由model层ajax动态获取由ctrl赋值于此对象上，如果没有data属性只是单纯的渲染不带数据的页面视图
`page.render();`即可实现渲染当前路由对应的页面及数据, 可无。 框架已处理页面的渲染，仅需要配置与匹配data与tmplname指向的模板

+由cro组成的路由表如下：
```javascript
 var router = {
        // '/sample': {
        //     tmpl : 'sample'    //require  页面调用的模块名称 template
        //     ctrl : sample optional 页面对应的ctrl的路径 ctrl
        //     title: 'SAMPLE'    //optional 页面标题
        //     data : {}          //optional 页面需要的数据（一般不会直接写入，由ajax动态写入）
        //     wrapper: '#sample' //optional 页面需要插入的DOM位置
        //     seo: {
        //          title:        //上面title是显示在页面上的，这个设置是<title>标签里的值
        //          keyword:,
        //          descption:
        //     }
        // },
        '/': {
            tmplname: 'app',
            ctrl: main,
            title: 'GoM App'
        },
        '/login': {
            tmplname: 'login',
            ctrl: auth,
            title: '登录'
        },
        '/module': {
           '/': {
               tmplname: 'module/list',
               ctrl: moduleList
           },
           '/:var': {
               tmplname: 'module/view',
               ctrl: moduleView
           },
           '/add': {
               tmplname: 'module/add',
               ctrl: moduleAdd
           },
           '/edit': {
                '/deep': {
                }
           }
      },
}
```

## config的配置

## 其它说明

+ GoM分页面渲染和ui组件渲染，其都继承于View对象,都有data属性，通过定义组织data，然后调用render方法可以实现不同的渲染方式';

+ 视图上就存在一个data对象，包含视图所需数据

## 内置：  
```
"requirejs":"~2.1.15",
"zepto": "~1.1.2",
"history.js": "1.8.0", (将去除)
```
