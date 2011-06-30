templateSettings =
    evaluate    : /<%([\s\S]+?)%>/g
    interpolate : /<%=([\s\S]+?)%>/g

# JavaScript micro-templating, similar to John Resig's implementation.
# Underscore templating handles arbitrary delimiters, preserves whitespace,
# and correctly escapes quotes within interpolated code.
_template = `function(a,c){var d=templateSettings;d="var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('"+a.replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(d.interpolate,function(a,b){return"',"+b.replace(/\\'/g,"'")+",'"}).replace(d.evaluate||null,function(a,b){return"');"+b.replace(/\\'/g,"'").replace(/[\r\n\t]/g," ")+"__p.push('"}).replace(/\r/g,"\\r").replace(/\n/g,"\\n").replace(/\t/g,"\\t")+"');}return __p.join('');";d=new Function("obj",d);return c?d(c):d}`

GOOGLE_JQUERY_SRC = "https://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js"
per_page = 20
tag = ""

POST_TEMPLATE = '
<div class="post" id="post-<%= id %>">
    <div class="player">
        <%= audio-player %>
    </div>
    <% if (caption){ %>
    <div class="caption">
        %laquo;<%= caption %>&raquo;
    </div>
    <% } %>
</div>'

class TumblrMusic
    constructor: (per_page, tag=null) ->
        this.per_page = per_page
        this.tag = tag
        this.xhr = null
        this.offset = 0
        this.el = null
        this.has_more_posts = true

        this._watch_interval = null

        if $? then this._init() else this._load_jquery()
    
    _load_jquery: () ->
        tag = document.createElement "script"
        tag.type = 'text/javascript'
        tag.src = GOOGLE_JQUERY_SRC
        tag.onload = () =>
            this._init()
        document.getElementsByTagName('head')[0].appendChild tag

    _init: ()->
        $('body').append '<h1 id="tumblelog"/>', '<div id="music"/>', '<div id="loader" />'
        this.el = $('#music')

        this._watch_interval = setInterval this._check_fetch, 200

        this.fetch()
    
    _check_fetch: ->
        if this._near_bottom()
            this._fetch()
    
    _near_bottom: ->
        b = 0 + $(document).height() - (this.el.scrollTop()) - $(window).height()
        return (b - 40 < $('#loader').height()) < 0

    _fetch: ->
        opts =
            type: "audio"
            format: "json"
            num: this.per_page
            start: this.offset
        
        if this.tag
            opts.tagged = this.tag
        
        if this.xhr isnt null
            this.xhr.abort()
        
        this.show_loader()

        this.xhr = $.getJSON '/api/read', opts, (data) =>
            json_data = JSON.parse(data.substr(22, (data.length - 24)))
            this._on_posts(json_data)
            this.xhr = null
        
        this.xhr.error (xhr, status, thrown) =>
            this.show_loader('Problemas :(', 'error')

    _on_posts: (json_data) ->
        if not this._post_tpl?
            this._post_tpl = _template POST_TEMPLATE

        if not $('#tumblelog').is ':visible'
            document.title = json_data.tumblelog.title
            $('#tumblelog').html(json_data.tumblelog.title).show()
        
        new_html = ''
        for post in json_data.posts
            new_html += this._post_tpl post

        this.el.append new_html

        if json_data.posts.length < batch_size
            this.hide_loader()
            clearInterval this._watch_interval
        else
            this.offset += json_data.posts.length
            
    show_loader: (message='Loading...', class_name='loading') ->
        $('#loader').html(message).addClass(class_name).show()
        
    hide_loader: () ->
        $('#loader').hide()

# export
window.TumblrMusic = TumblrMusic