$(document).ready(function (){

    function draw_nothing() {
        var canvas;
        var ctx;
        var tool;
        var color;

        this.init = function() {
            init_color_bar();
            init_canvas();

            // set default tool
            color = '#E00000';
            tool = new tool_pencil_point();
            swap_tool(tool);
        };

        function init_canvas() {
            canvas = $('#canvas');

            // fit canvas to window
            ctx = canvas.get(0).getContext('2d');
            ctx.canvas.width  = window.innerWidth;
            ctx.canvas.height = window.innerHeight;

            // give canvas an img link
            var dataURL = canvas.get(0).toDataURL();
            $('#canvas-img').attr('src', dataURL);
        }

        /* Color pallette */
        function init_color_bar() {
            color_bar = $('#color-bar');

            ctx = color_bar.get(0).getContext('2d');
            ctx.canvas.width  = window.innerWidth;
            ctx.canvas.height = window.innerHeight / 8;

            /* Draw color squares onto pallette */
            colors = ['red', 'green', 'blue', 'yellow', 'orange', 'brown'];
            $(colors).each(function(index) {
                ctx.fillStyle = colors[index];
                ctx.fillRect(index * 100 + (index * 15), 0, ctx.canvas.height, ctx.canvas.height);
            });

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

        function tool_pencil_point() {
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
