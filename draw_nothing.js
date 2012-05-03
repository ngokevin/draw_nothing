$(document).ready(function (){

    var imgur_key = 'c45423f0d9371cb1b21139ec67c36c79';

    function draw_nothing() {
        var canvas;
        var ctx;

        var tool;
        var color;
        var brushSize;

        this.init = function() {
            initColorBar();
            initCanvas();

            // set default tool
            color = '#E00000';
            tool = new toolPencilPoint();
            swap_tool(tool);
        };

        function initCanvas() {
            canvas = $('#canvas');

            // fit canvas to window with 960px at max
            ctx = canvas.get(0).getContext('2d');
            if ($(window).width() <= 960) {
                ctx.canvas.width = $(window).width();
            }
            else {
                var padding = ($(window).width() - 960) / 2;
                ctx.canvas.width = '960';
                canvas.css('margin-top', '-3px');
                canvas.css('margin-left', padding + 'px');
                canvas.css('margin-right', padding + 'px');
                canvas.css('background', 'rgb(250,250,250)');
            }
            ctx.canvas.height = $(window).height() - $(window).height() / 8 - 50;

            // give canvas an img link
            var dataURL = canvas.get(0).toDataURL();
            $('#canvas-img').attr('src', dataURL);
        }

        /* Color pallette */
        function initColorBar() {
            color_bar = $('#color-bar');

            ctx = color_bar.get(0).getContext('2d');
            ctx.canvas.width  = $(window).width()
            ctx.canvas.height = $(window).height() / 8;

            // draw color squares onto pallette
            colors = ['red', 'green', 'blue', 'yellow', 'orange', 'brown'];

            // evenly space out colors
            var padding = ($(window).width() - colors.length * ctx.canvas.height) / colors.length;

            $(colors).each(function(index) {
                ctx.fillStyle = colors[index];
                ctx.fillRect(index * ctx.canvas.height + (index * padding) + padding / 2, 0, ctx.canvas.height, ctx.canvas.height);
            });

            // set color on click
            color_bar.mousedown(function(e) {
                var x = e.pageX - this.offsetLeft;
                var y = e.pageY - this.offsetTop;

                var c = this.getContext('2d');
                var p = c.getImageData(x, y, 1, 1).data;
                color = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);

                function rgbToHex(r, g, b) {
                    if (r > 255 || g > 255 || b > 255)
                    throw "Invalid color component";
                    return ((r << 16) | (g << 8) | b).toString(16);
                };

            });
        };

        function swap_tool(tool) {
            canvas.mousedown(tool.mousedown);
            canvas.mouseup(tool.mouseup);
            canvas.mousemove(tool.mousemove);
        };

        function toolPencilPoint() {
            var tool = this;
            this.started = false;

            this.mousedown = function(e) {
                tool.started = true;
                ctx.fillStyle = color;
                ctx.fillRect (e.pageX - this.offsetLeft, e.pageY - this.offsetTop, 5, 5);
            };

            this.mouseup = function(e) {
                tool.started = false
            };

            this.mousemove = function(e) {
                if (tool.started) {
                    ctx.fillStyle = color;
                    ctx.fillRect(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, 5, 5);
                }
            };
        }

    }

    draw_nothing = new draw_nothing();
    draw_nothing.init();

});
