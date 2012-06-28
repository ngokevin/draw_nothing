$(document).ready(function (){

    var minDesktop = 800;
    var minMobile= 320;

    // prevent scrolling on touch devices
    document.body.addEventListener('touchmove', function(e) {
        event.preventDefault();
    }, false);

    function draw_nothing() {
        var canvas;
        var ctx;

        var windowWidth = $(window).width();
        var windowHeight= $(window).height();

        var tool;
        var color;
        var brushSize;

        this.init = function() {
            initCanvas();
            initLeftPanel();
            initRightPanel();
            initBrushSizer();
            initImgLoader();

            // set default tool
            color = '#E00000';
            tool = new toolPencilPoint();
            swap_tool(tool);
        };


        function initCanvas() {
            var aspect = 4 / 3;
            var canvasPaddingAspect = 3 / 1;

            canvas = $('#canvas');
            ctx = canvas.get(0).getContext('2d');

            // If mobile, fit canvas width to screen.
            if (windowWidth <= minDesktop) {
                ctx.canvas.width = windowWidth
            }
            // If desktop, fit canvas according to canvasPaddingAspect.
            else {
                // 2 * padding + canvas = width; aspect = canvas / padding.
                ctx.canvas.width = windowWidth / (2 / canvasPaddingAspect + 1);
                var padding = (windowWidth - ctx.canvas.width) / 2;
                canvas.css('margin-left', padding + 'px');
                canvas.css('margin-right', padding + 'px');
                canvas.css('background', 'rgb(255,255,255)');
            }

            ctx.canvas.height = ctx.canvas.width / aspect;
            var panelWidth = (windowHeight - ctx.canvas.height) / 2;
            canvas.css('margin-top', panelWidth + 'px');

            // Give canvas an img link.
            var dataURL = canvas.get(0).toDataURL();
            $('#canvas-img').attr('src', dataURL);
        }


        function initLeftPanel() {
            var panelWidth = (windowWidth - ctx.canvas.width) / 2;
            $('#left-panel').css('width', panelWidth + 'px');

            // Color picker, sets color to selected value using callback.
            c = ColorPicker(
                document.getElementById('slide'),
                document.getElementById('picker'),
                function(hex, hsv, rgb, mousePicker, mouseSlide) {
                    color = hex;
                    ColorPicker.positionIndicators(
                        $('.slide-indicator')[0],
                        $('.picker-indicator')[0],
                        mouseSlide, mousePicker
                    );
                }
            );

            var colorPicker = $('.color-picker');
            var pickerWidth = colorPicker.width();
            colorPicker.css('marginLeft', (panelWidth - pickerWidth) / 2.5);


        }


        function initRightPanel() {
            var padding = (windowWidth - ctx.canvas.width) / 2;
            $('#right-panel').css('width', padding + 'px');
        }


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

        /* Buttons to decrease/increase brush size */
        function initBrushSizer() {
            brushSize = 5;

            $('#brush-smaller').click(function() {
                if (brushSize - 10 > 0) {
                    brushSize -= 5;
                }
            });
            $('#brush-larger').click(function() {
                brushSize += 5;
            });
        }

        /* Button to draw an image to the canvas from url */
        function initImgLoader() {
            $('#url-loader').click(function() {
                var url = prompt('Background Loader: enter image URL');
                img = Image();
                img.src = url;
                img.onload = function() {
                    ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
                }
            });
        };

        function swap_tool(tool) {
            canvas.mousedown(tool.mousedown);
            canvas.mouseup(tool.mouseup);
            canvas.mousemove(tool.mousemove);
            canvas.get(0).ontouchstart = tool.touch;
            canvas.get(0).ontouchmove = tool.touch;
        };

        function toolPencilPoint() {
            var tool = this;
            this.started = false;

            this.mousedown = function(e) {
                e.preventDefault();
                tool.started = true;
                ctx.fillStyle = color;
                ctx.fillRect (e.pageX - this.offsetLeft, e.pageY - this.offsetTop, brushSize, brushSize);
            };

            this.mouseup = function(e) {
                tool.started = false
            };

            this.mousemove = function(e) {
                e.preventDefault();
                if (tool.started) {
                    ctx.fillStyle = color;
                    ctx.fillRect(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, brushSize, brushSize);
                }
            };

            this.touch = function(e) {
                ctx.fillStyle = color;
                for (var i = 1; i <= e.touches.length; i++) {
                    var p = getCoords(e.touches[i - 1], this);
                    ctx.fillRect(p.x - this.offsetLeft, p.y - this.offsetTop, brushSize, brushSize);
                }
            };
       }

        // Get the coordinates for a mouse or touch event
        function getCoords(e, canvas) {
            if (e.offsetX) {
                return { x: e.offsetX, y: e.offsetY };
            }
            else if (e.layerX) {
                return { x: e.layerX, y: e.layerY };
                }
            else {
                return { x: e.pageX, y: e.pageY };
            }
        }

    }

    draw_nothing = new draw_nothing();
    draw_nothing.init();

});
