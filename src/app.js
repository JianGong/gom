/*
 * Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
//@todo config ref by everywhere
define(['Page', 'Url', 'Store'], function(Page, Url, Store){
    /**
     * App对象
     * @constructs App
     * @param {object} config
     * @return {Object} App
     * @example
     * new App(config, route); 传入配置文件与路由文件
     */
    //var expires = 1000*60*5; //5min 过期时间，后面将从config.js配置里获取;

    var App = Class.extend({
        init: function (config, route) {
            this.config = config || {};
            this.route = route || {};
            this.model = {};
            this.history = [];
        },
        run: function(){       //App初始化
            var that = this;
            var isHistoryApi = !!(window.history && history.pushState);
            if(!isHistoryApi){
                return;
            }

            History.Adapter.bind(window, 'statechange', function(e){
                var state = History.getState();
                state.data.hash = state.data.hash || '/';
                that._routeByHash(state.data.hash);
            });
            History.Adapter.trigger(window, 'statechange');

            this.initHref();
        },
        initHref: function(){
            if ('addEventListener' in document) {
                document.addEventListener('DOMContentLoaded', function() {
                    FastClick.attach(document.body);
                }, false);
            }
            //对所有链接进行html5处理
            //@todo 需要处理为智能判断Url与绝对、相应地址
            //? 站内链接跳转
            //# 站内组件或hash跳转
            //http:// 站间跳转
            //''为空时当作非链接处理
            var that = this;
            $("body").off().on("click", 'a', function(){
                var $t = $(this),
                    href = $t.attr('href');

                if(!href || !!~href.indexOf('#') || !href.indexOf('javascript:')) return; //无链接或不存在hash或存在javascript:跳转不处理
                var hash =  href.substring(1);
                History.pushState({hash: hash, prevHash: that.getPrevHash()}, $t.attr('title'), '?'+hash);
                return false;
            }).on('click', '.icon-left-nav', function(){
                History.go(-1);
                return false;
            });
        },
        getViewTmpl: function(tmplname, callback){
            var that = this, view = Store.get('tmplname');
            if(!!view){
                callback?callback(view):null;
                return;
            }
            $.ajax({url:'/views/'+tmplname+'.html', dataType:'html', success: function (tmpl){
                Store.set(tmplname, tmpl, that.config.expires);
                callback?callback(tmpl):null;
            }});
        },
        getPrevHash: function(){
            return location.search.substring(1);
        },
        setPage: function(opts){
            if(!opts){
                return;
            }
            opts.config = this.config;
            opts.isback = this.isBack();
            return new Page(opts);
        },
        /**
         * 根据完整hash获取页面对象(即具体路由指向的路由表对象)
         * 路由查找规则，根据hash路径数据长度查找CRO对应对象，在每个长度的index找不到则查找'/:var'， 在最后index有‘/’则查找'/';
         * @method App#getCRO
         * @return {object} CRO (Current Router Object)返回具体路由指向的路由表对象
         * @example ?module/list  ?module/123
         */
        getCRO: function (hashPath) {
            var hashRoute = Url.getHashPath(hashPath, true),
                router = this.route;
            if (hashPath === '/') {
                return router[hashPath];
            }

            var CRO = router, hashLen = hashRoute.length, index=0, hashIndex=0;
            for(;index<hashLen; index++){
                hashIndex = hashRoute[index];
                if(!index){
                    CRO = CRO['/'+hashIndex];        //hash index=0时必须完全匹配，第二级才会有 '/'与':var'的路由
                    if(CRO === void 0) return;
                }else{
                    CRO = CRO['/'+hashIndex] || CRO; //如果在当前index没有找到对应对象时，在此index上还保留上一个index的对象
                }

                if(CRO.index === void 0){            //没有index则加上， 有的话说明取的是上一次设置的CRO,即本次index没有取到值
                    CRO.index = index;               //没有则打上标签
                }
                if ((index === hashLen-1) && CRO.hasOwnProperty('/')){  //最后一个index时检查 '/'
                    CRO = CRO['/'];
                    return CRO;
                }
                //如果CRO的index还停留在上一个index，说明在此index上没找到路由对象
                if(CRO.index === index-1 && CRO.hasOwnProperty('/:var')){
                    CRO = CRO['/:var'];
                    CRO.index = index;
                    CRO.routeParams = hashIndex;
                    return CRO;
                }
            }
            CRO.hashs = hashRoute;
            return CRO;
        },
        //设置cro, 用于页面向某个页面传递数据
        setCRO: function(cro){

        },
        /**
         * 根据完整hash路由或CRO对象到页面，封装了_routeByHash 与 _routeByCRO实现
         * @method App#goto
         * @example module/list  module/123
         * * ? 站内链接跳转
         * # 站内组件或hash跳转(仅页面内)
         * http(s)://或// 站间跳转 判断是否本域,本域的话跳转到search部分
         * @todo 页面间数据传递
         */
        goto: function(where){
            var isstr = typeof where === 'string';
            if(isstr){
                var urls = Url.get(where);
                var isThisHost = urls.host+urls.port === location.host;
                if(/^(https:)?\/\//.test(where)){
                    if(!isThisHost){
                        location.href = where;
                        return;
                    }else{
                        where = Url.getHashPath(urls.search);   //获取serach里的path部分
                    }
                }
            }
            this[isstr ? '_routeByHash' : '_routeByCRO'](where);
        },

        /**
         * 根据完整hash路由到页面
         * @method App#_routeByHash
         * @example module/list  module/123
         */
        _routeByHash: function (hashPath) {
            this._manageHistory(hashPath);
            var CRO = this.getCRO(hashPath);
            this._routeByCRO(CRO);
        },

        _routeByCRO: function(CRO){
            var that = this;
            if(this.isRouteNotFound(CRO)){
                return;
            }

            var ctrl = CRO.ctrl;
            if(ctrl){
                CRO.events = ctrl.events;   //将ctrl的事件设置到当前路由对象
            }

            var pageInit = function(){
                var page = that.setPage(CRO);   //初始页面并绑定事件
                if(ctrl && ctrl.init){
                    page.hashs =  CRO.hashs;    //将hash对象传递到页面
                    ctrl.init(page);            //将传递到页面(ctrl)的所有信息;
                }else{
                    page.render();
                }
            };

            if(!CRO.tmplname){
                pageInit();
                return;
            }

            this.getViewTmpl(CRO.tmplname, function(tmpl){
                CRO.tmpl = tmpl;
                pageInit();
            });
        },
        _manageHistory: function(hashPath){
            if(this.getLastHashByLastIndex(1) === hashPath){
                return;
            }
            var history = this.history;
            history.push(hashPath);
            if(history.length > 10){
                history.shift();
            }
            //console.log(history, 'THIS HISTORY');
        },
        //从倒数位置index取历史hash
        getLastHashByLastIndex: function(index){
            var history = this.history;
            return history[history.length-index];
        },
        isBack: function(){
            var oldHashArr = Url.getHashPath(this.getLastHashByLastIndex(2), true),
                newHashArr = Url.getHashPath(this.getLastHashByLastIndex(1), true);
            console.log(_.compact(oldHashArr), _.compact(newHashArr),   'IS GO OR BACK');
            return _.compact(newHashArr).length < _.compact(oldHashArr).length;
        },
        //判断是否存在CRO而404
        isRouteNotFound: function(CRO){
            if (!CRO) {
                this.route['/404']['data'] = {Url: location.href};
                this.goto('404');
                return true;
            }
            return false;
        }
    });
    return App;
});
