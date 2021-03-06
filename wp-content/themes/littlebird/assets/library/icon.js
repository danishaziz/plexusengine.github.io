(function() {
    var root = this;

    var icon = function () {
        if (!(this instanceof icon)) return new icon();
    
        this.queue = [];
        this.shapes = {};
        
        this.errorshape = ["M26.774,0 0,0 0,20.753 4.129,61.713 23.863,61.713 26.774,20.753 z M13.242,70.159c6.821,0,12.348,5.531,12.348,12.348 c0,6.821-5.527,12.348-12.348,12.348c-6.82,0-12.349-5.526-12.349-12.348C0.893,75.689,6.422,70.159,13.242,70.159z"];
    }
    
    root.icon = icon();
    
    //// LOADING
    var itemsLoading = 0;
    
    var getJSON = function(url, callback) {
        var handle;
        
        if (window.XMLHttpRequest)
          handle = new XMLHttpRequest();
          
        handle.onreadystatechange = function() {
            if (handle.readyState == 4 && handle.status == 200)
                callback(JSON.parse(handle.responseText));
        };
        
        handle.open("GET", url, true);
        handle.send();
    };
    
    icon.prototype.load = function(data) {
        var plugin = this,
            requestFiles = function (urlList) {
                urlList.forEach(function(url, index) {
                    itemsLoading++;
                    
                    getJSON(url, function (data) {
                        merge(plugin.shapes, data);
                        
                        if (--itemsLoading == 0) execQueue.call(plugin);
                    })
                });
            };

        // if array, assume its a list of urls (AJAXZ!)
        if (typeof data === 'object' && (urls.constructor === Array))
            requestFiles(data);

        // if it is a filepath, ajax it for the shape strings
        else if (typeof data === 'string' && data.indexOf('.json') != -1)
            requestFiles([data]);
    };
    
    var isLoading = function() {
        return (itemsLoading > 0 || this.shapes.length == 0);
    };
    
    
    //// QUEUE
    
    var addToQueue = function(element) {
        this.queue.push(element)
    };
    
    var execQueue = function() {
        var plugin = this;
        this.queue.forEach(function(item) {
            plugin.render(item);
        })
    };

    
    //// RENDERING
    
    icon.prototype.render = function(selector) {
        if (selector instanceof jQuery) 
            selector = selector[0];
            
        if (isLoading.call(this)) {
            addToQueue.call(this, selector);
            return;
        }
            
        draw.call(this, selector);
    };
    
    var draw = function(element) {
        var paths = selectorToPaths.call(this, element.getAttribute('data-iconjs')),
            ns = "http://www.w3.org/2000/svg",
            svg = document.createElementNS(ns, 'svg');
            
        svg.setAttribute('style', "overflow: hidden; position: relative;");
        svg.setAttribute('height','100%');
        svg.setAttribute('width', '100%');
        svg.setAttribute('version', '1.1');
        svg.setAttribute('xmlns', ns);
        svg.setAttribute('preserveAspectRatio', 'meet');
        
        paths.forEach(function(string, index) {
            var path = document.createElementNS(ns, 'path');
            
            path.setAttribute('class', 'layer' + (index + 1));
            path.setAttribute('d', string);
            
            svg.appendChild(path)
        })
        
        element.appendChild(svg);
        
        var box = svg.getBBox();
        svg.setAttribute('viewBox', [box.x, box.y, box.width, box.height].join(" "));
    };
    
    //// Utilities

    var selectorToPaths = function (selector) {
        if (this.shapes[selector] === undefined)
            return this.errorshape;

        return (typeof this.shapes[selector] === 'string') ? [this.shapes[selector]] : this.shapes[selector];
    };
    
    // Merge Objects (alters object)
    var merge = function (object, extend) {
        for (var attrname in extend) { object[attrname] = extend[attrname]; }
    }
}).call(this);