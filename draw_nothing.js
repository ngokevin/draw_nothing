$(document).ready(function (){

    function init() {

        var canvas = $('#canvas');
        var canvasElement = canvas.get(0);

        // fit canvas to window
        var ctx = canvasElement.getContext('2d');
        ctx.canvas.width  = window.innerWidth;
        ctx.canvas.height = window.innerHeight;

        tool = new tool_pencil();

        canvas.mousedown({'ctx': ctx}, tool.mousedown);
        canvas.mouseup({'ctx': ctx}, tool.mouseup);
        canvas.mousemove({'ctx': ctx}, tool.mousemove);
    }

    function tool_pencil() {
        var tool = this;
        this.started = false;

        this.mousedown = function(e) {
            tool.started = true;
            e.data.ctx.fillStyle = 'rgb(200,0,0)';
            e.data.ctx.fillRect (e.pageX - this.offsetLeft, e.pageY - this.offsetTop, 5, 5);
        };

        this.mouseup = function(e) {
            tool.started = false
        };

        this.mousemove = function(e) {
            if(tool.started) {
                e.data.ctx.fillStyle = 'rgb(200,0,0)';
                e.data.ctx.fillRect (e.pageX - this.offsetLeft, e.pageY - this.offsetTop, 5, 5);
            }
        };

    }

    init();

});
