$(document).ready(function (){

    var canvas = $('#canvas');
    var canvasElement = canvas.get(0);

    var ctx = canvasElement.getContext("2d");
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

    canvas.mousedown(function(e) {
        ctx.fillStyle = "rgb(200,0,0)";
        ctx.fillRect (e.pageX - this.offsetLeft, e.pageY - this.offsetTop, 5, 5);
    });

});
