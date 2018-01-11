;(function ($) {
    //带省略号的分页插件
    var EllipsisPaginator = function (ele, opt) {
        this.init(ele, opt);
    }
    EllipsisPaginator.prototype = {
        init: function (ele, opt) {
            this.$element = $(ele);
            this.defaults = {
                "totalPages":  1, //默认总页数
                "currentPage": 1, //当前页
                "pageNum": 6, //循环页码的个数
                "onPageClicked": null,
                "itemContainerClass": function (type, page, current) {
                    if (type == "prev" && current === 1 || type == 'next' && current === this.totalPages) {
                        return "disabled";
                    }
                    if (type == "page" || type == "prev" || type == "next") {
                        return (page === current) ? "active" : "";
                    }
                }
            }
            this.options = $.extend({}, this.defaults, opt);

            this.totalPages = this.options.totalPages;
            this.currentPage = this.options.currentPage;
            this.pageNum = this.options.pageNum;
            // this.firstIndex = 1;
            //this.lastIndex = 1; //循环结束的最后一个页码
            this.listen();
            this.render();

        },  
        /*
         * prev,next 上一页，下一页
         * fist,last 页码1，最后一个页码
         * firstMore, secondMore 第一个省略号，第二个省略号
         * page 循环的页码
        */
        render: function () {
            var pages = this.getPages(), pageContainer = this.$element,
                prev, next, first, last, firstMore,secondMore, page;

            pageContainer.empty();
            if (pages.prev) {
                prev = this.buildPageItem('prev', pages.prev);
                if (prev) {
                    pageContainer.append(prev);
                }
            }
            if (pages.first) {
                first = this.buildPageItem('first', pages.first);
                if (first) {
                    pageContainer.append(first);
                }
            }
            if (pages.firstMore) {
                firstMore = this.buildPageItem('firstMore');
                if (firstMore) {
                    pageContainer.append(firstMore);
                }
            }
            if (pages.page) {
                for (let i = 0, len = pages.page.length; i<len; i++) {
                    page = '';
                    page = this.buildPageItem('page', pages.page[i]);
                    if (page) {
                        pageContainer.append(page);
                    }
                    
                }
            }
            if (pages.secondMore) {
                secondMore = this.buildPageItem("secondMore");
                if (secondMore) {
                    pageContainer.append(secondMore);
                }
            }
            if (pages.last) {
                last = this.buildPageItem("last", pages.last);
                if (last) {
                    pageContainer.append(last);
                }
            }
            if (pages.next) {
                next = this.buildPageItem("next", pages.next);
                if (next) {
                    pageContainer.append(next);
                }
            }
        },
        getPages: function () {
            var totalPages = this.totalPages, output = {};
            if (this.currentPage > 1) { //上一页
                output.prev = this.currentPage - 1;
            } else {
                output.prev = 1;
            }
            if (this.currentPage < totalPages) { //下一页
                output.next = this.currentPage + 1;
            } else {
                output.next = totalPages;
            }
            //页码1是否显示
            //判断条件：当前页>=页码repeat数量，并且保证当前页不是最后一页，才会显示页码1
            if (this.currentPage >= this.pageNum && this.totalPages !== this.pageNum) {
                output.first = 1; 
            }

            //ng-repeat的部分
            this.getFirstIndex(); //获取循环开始的第一个页码
            output.page = this.getRepeatPage(); //获取循环部分的页码

            //页码1后面的省略号是否显示
            //判断条件：当前页>=页码repeat数量，并且保证当前页不是最后一页
            if (this.currentPage >= this.pageNum && this.totalPages !== this.pageNum && this.firstIndex > 2) {
                output.firstMore = true; 
            } else {
                output.firstMore = false;
            }

            //ng-repeat后面的省略号是否显示
            if (this.totalPages > this.pageNum && this.firstIndex <= this.totalPages - this.pageNum && this.totalPages > this.lastIndex + 1) {
                output.secondMore = true;
            } else {
                output.secondMore = false;
            }

            //最后一个页码是否显示
            if (this.totalPages > this.pageNum && this.firstIndex <= this.totalPages - this.pageNum && this.totalPages > this.lastIndex) {
                output.last = this.totalPages;
            }

            return output;
        },
        getFirstIndex: function() {
            //获取循环开始的第一个页码
            if (this.currentPage >= this.pageNum) {
                this.firstIndex = this.currentPage - Math.floor(this.pageNum /2);
            } else {
                this.firstIndex = 1;
            }
            if (this.firstIndex > this.totalPages - this.pageNum) {
                this.firstIndex = this.totalPages - this.pageNum + 1;
            }
        },
        getRepeatPage: function() {
            var pages = [], total = this.totalPages;
            if (total <= this.pageNum) { //分页总数 <= 页码保留个数
                for (let j = 1; j<= total; j++) {
                    pages.push(j);
                }
            } else {
                for (var i = this.firstIndex; i < this.firstIndex + this.pageNum; i ++) {
                        pages.push(i);
                }
                this.lastIndex = i -1;
            }
            return pages;
        },
        show: function (page) {
            //每次click(上一页，下一页或页码),都首先设置当前页，之后的getPages, render都据此渲染
            this.currentPage = page; //当前页就是被点击的这个page
            this.render();
        },
        showNext: function () {
            var pages = this.getPages();
            if (pages.next) {
                this.show(pages.next);
            }
        },
        showPrevious: function () {
            var pages = this.getPages();
            if (pages.prev) {
                this.show(pages.prev);
            }
        },
        listen: function () {
            this.$element.off("page-clicked");
            if (typeof (this.options.onPageClicked) === "function") {
                this.$element.bind("page-clicked", this.options.onPageClicked); //是为容器绑定的事件处理函数
            }
            this.$element.bind("page-clicked", this.onPageClicked);
        },
        onPageItemClicked: function (event) { //click事件对象,在buildPageItem的时候绑定到item的click事件中
            var type = event.data.type,
                page = event.data.page;
            this.$element.trigger('page-clicked', [event, type, page]); //this.$element触发了事件处理函数onPageClicked
        },
        onPageClicked: function (event, originalEvent, type, page) {
            //event, trigger的page-clicked事件对象
            //当前this，是该事件处理程序的触发者,容器
            //page是被点击的页码
            var currentTarget = $(event.currentTarget);
            switch (type) {
                case "next":
                    currentTarget.ellipsisPaginator('showNext'); //在入口更改了this的指向
                    break;
                case "prev":
                    currentTarget.ellipsisPaginator("showPrevious");
                    break;
                case "page":
                    currentTarget.ellipsisPaginator("show", page);
                    break;
                case "first":
                    currentTarget.ellipsisPaginator("show", page);
                    break;
                case "last":
                    currentTarget.ellipsisPaginator("show", page);
                    break;

            }
        },
        buildPageItem: function (type, page) { //创建页码，并绑定click事件
            var itemContainer = $("<a class='item'></a>"),
                moreContainer = $("<span class='more'>...</span>"),
                itemContainerClass = this.options.itemContainerClass(type, page, this.currentPage);
            switch (type) {
                case "prev":
                    text = "上一页"
                    break;
                case "next":
                    text = "下一页";
                    break;
                case "firstMore":
                    return moreContainer;
                case "secondMore":
                    return moreContainer;
                case "first":
                    text = "1";
                    break;
                case "last":
                    text = page;
                    break;
                case "page":
                    text = page;
                    break;
            }
            if (type != "firstMore" && type != "secondMore") {
                itemContainer.addClass(itemContainerClass).html(text)
                            .on("click", null, {type: type, page: page}, $.proxy(this.onPageItemClicked, this));
            }
            return itemContainer;

        }
    }


    $.fn.ellipsisPaginator = function (option) {
        var args = arguments, result = null;
        $(this).each(function (index, item) {
            var $this = $(item),
                data = $this.data('ellipsisPaginator'),
                options = (typeof option !== 'object') ? null : option;
            if (!data) { //第一次实例化
                data = new EllipsisPaginator(this, options);
                $this = $(data.$element);
                $this.data('ellipsisPaginator', data);
                return;
            }
            //跳转页码
            if (typeof option === 'string') {
                if (data[option]) {
                    result = data[option].apply(data, Array.prototype.slice.call(args, 1)); 
                } else {
                    throw "Method" + option + "does not exist";
                }
            } else {
                //setOptions重新渲染页码
            }
        })
        return result;
    }
})(window.jQuery)