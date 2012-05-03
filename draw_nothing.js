$(document).ready(function (){

    function draw_nothing() {
        var canvas;
        var ctx;
        var tool;

        this.init = function() {
            canvas = $('#canvas');
            var canvasElement = canvas.get(0);

            // fit canvas to window
            ctx = canvasElement.getContext('2d');
            ctx.canvas.width  = window.innerWidth;
            ctx.canvas.height = window.innerHeight;

            tool = new tool_pencil_point();
            swap_tool(tool);
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
                ctx.fillStyle = 'rgb(200,0,0)';
                ctx.fillRect (e.pageX - this.offsetLeft, e.pageY - this.offsetTop, 5, 5);
            };

            this.mouseup = function(e) {
                tool.started = false
            };

            this.mousemove = function(e) {
                if(tool.started) {
                    ctx.fillStyle = 'rgb(200,0,0)';
                    ctx.fillRect (e.pageX - this.offsetLeft, e.pageY - this.offsetTop, 5, 5);
                }
            };
        }

    }

    draw_nothing = new draw_nothing();
    draw_nothing.init();

});
