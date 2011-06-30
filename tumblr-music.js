(function() {
  var GOOGLE_JQUERY_SRC, POST_TEMPLATE, TumblrMusic, per_page, tag, templateSettings, _template;
  var __slice = Array.prototype.slice, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  templateSettings = {
    evaluate: /<%([\s\S]+?)%>/g,
    interpolate: /<%=([\s\S]+?)%>/g
  };
  _template = function(a,c){var d=templateSettings;d="var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('"+a.replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(d.interpolate,function(a,b){return"',"+b.replace(/\\'/g,"'")+",'"}).replace(d.evaluate||null,function(a,b){return"');"+b.replace(/\\'/g,"'").replace(/[\r\n\t]/g," ")+"__p.push('"}).replace(/\r/g,"\\r").replace(/\n/g,"\\n").replace(/\t/g,"\\t")+"');}return __p.join('');";d=new Function("obj",d);return c?d(c):d};
  GOOGLE_JQUERY_SRC = "https://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js";
  per_page = 20;
  tag = "";
  POST_TEMPLATE = "<div class=\"post\" id=\"post-<%= post['id'] %>\">\n    <div class=\"player\">\n        <%= post['audio-player'] %>\n    </div>\n    <% if (post['audio-caption']){ %>\n    <div class=\"caption\">\n        <%= post['audio-caption'] %>\n    </div>\n    <% } %>\n    <div class=\"meta\">\n        <span class=\"title\"><%= post['id3-title'] %></span> by <span class=\"artist\"><%= post['id3-title'] %></span>\n    </div>\n</div>";
  TumblrMusic = (function() {
    function TumblrMusic(per_page, tag, tpl) {
      if (tag == null) {
        tag = null;
      }
      if (tpl == null) {
        tpl = null;
      }
      this.per_page = per_page;
      this.tag = tag;
      this.xhr = null;
      this.offset = 0;
      this.el = null;
      this.has_more_posts = true;
      this._watch_interval = null;
      this._all_posts = [];
      this._tpl = tpl ? tpl : POST_TEMPLATE;
      if (typeof $ !== "undefined" && $ !== null) {
        this._init();
      } else {
        this._load_jquery();
      }
    }
    TumblrMusic.prototype._debug = function() {
      var what;
      what = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (console && (console.log != null)) {
        return console.log(what);
      }
    };
    TumblrMusic.prototype._load_jquery = function() {
      tag = document.createElement("script");
      tag.type = 'text/javascript';
      tag.src = GOOGLE_JQUERY_SRC;
      tag.onload = __bind(function() {
        return this._init();
      }, this);
      return document.getElementsByTagName('head')[0].appendChild(tag);
    };
    TumblrMusic.prototype._init = function() {
      var cb;
      $('body').append('<h1 id="tumblelog"/>', '<div id="music"/>', '<div id="loader" />');
      this.el = $('#music');
      cb = __bind(function() {
        return this._check_fetch;
      }, this);
      this._watch_interval = setInterval(cb, 200);
      return this._fetch();
    };
    TumblrMusic.prototype._check_fetch = function() {
      if (this._near_bottom()) {
        return this._fetch();
      }
    };
    TumblrMusic.prototype._near_bottom = function() {
      var b;
      b = 0 + $(document).height() - (this.el.scrollTop()) - $(window).height();
      return (b - 40 < $('#loader').height()) < 0;
    };
    TumblrMusic.prototype._fetch = function() {
      var opts;
      opts = {
        type: "audio",
        format: "json",
        num: this.per_page,
        start: this.offset,
        debug: 'true'
      };
      if (this.tag) {
        opts.tagged = this.tag;
      }
      if (this.xhr !== null) {
        this.xhr.abort();
      }
      this.show_loader();
      this.xhr = $.get('/api/read', opts, __bind(function(data) {
        var json_data;
        json_data = JSON.parse(data);
        this._on_posts(json_data);
        return this.xhr = null;
      }, this));
      return this.xhr.error(__bind(function(xhr, status, thrown) {
        this.show_loader('Problemas :(', 'error');
        return this._debug(xhr, status, thrown);
      }, this));
    };
    TumblrMusic.prototype._on_posts = function(json_data) {
      var new_html, post, _i, _len, _ref;
      if (!(this._post_tpl != null)) {
        this._post_tpl = _template(this._tpl);
      }
      document.title = json_data.tumblelog.title;
      $('#tumblelog').html(json_data.tumblelog.title).show();
      new_html = '';
      this._last_json = json_data;
      _ref = json_data.posts;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        post = _ref[_i];
        new_html += this._post_tpl({
          post: post
        });
        this._all_posts.push(post);
      }
      this.el.append(new_html);
      if (json_data.posts.length < this.per_page) {
        this.hide_loader();
        return clearInterval(this._watch_interval);
      } else {
        return this.offset += json_data.posts.length;
      }
    };
    TumblrMusic.prototype.rerender = function(tpl) {
      var post, _i, _len, _ref;
      if (tpl == null) {
        tpl = null;
      }
      if (tpl) {
        this._tpl = tpl;
      }
      this._post_tpl = _template(this._tpl);
      this.el.html('');
      _ref = json_data.posts;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        post = _ref[_i];
        new_html += this._post_tpl({
          post: post
        });
        this._all_posts.push(post);
      }
      return this.el.append(new_html);
    };
    TumblrMusic.prototype.show_loader = function(message, class_name) {
      if (message == null) {
        message = 'Loading...';
      }
      if (class_name == null) {
        class_name = 'loading';
      }
      return $('#loader').html(message).addClass(class_name).show();
    };
    TumblrMusic.prototype.hide_loader = function() {
      return $('#loader').hide();
    };
    return TumblrMusic;
  })();
  window.TumblrMusic = TumblrMusic;
  window._template = _template;
}).call(this);
