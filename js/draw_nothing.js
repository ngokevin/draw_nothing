$(document).ready(function (){

    function dbg(str) { console.log(str); }

    var minDesktop = 800;
    var minMobile= 320;
    var DEFAULT_BRUSH_SIZE = 5;
    var FOOTER = 50;

    // prevent scrolling on touch devices
    document.body.addEventListener('touchmove', function(e) {
        event.preventDefault();
    }, false);


    function draw_nothing() {
        var canvas;
        var ctx;

        var windowWidth = $(window).width();
        var windowHeight= $(window).height();

        var brush;
        var color;
        var brushSize;

        this.init = function() {
            initCanvas();
            initLeftPanel();
            initRightPanel();
            initImgLoader();

            // set default brush
            color = '#E00000';
            brushSize = DEFAULT_BRUSH_SIZE;
            brush = new brushPencilPoint();
            swap_brush(brush);
        };


        function initCanvas() {
            var aspect = 4 / 3;
            var canvasPaddingAspect = 3 / 1;
            var canvasWidth, canvasHeight, padding;

            canvas = $('#canvas');
            ctx = canvas.get(0).getContext('2d');

            // If mobile, fit canvas width to screen.
            if (windowWidth <= minDesktop) {
                canvasWidth = windowWidth
                padding = 0;
            }
            // If desktop, fit canvas according to canvasPaddingAspect.
            else {
                // 2 * padding + canvas = width; aspect = canvas / padding.
                canvasWidth = windowWidth / (2 / canvasPaddingAspect + 1);
                padding = (windowWidth - canvasWidth) / 2;
            }
            // Readjust height if needed.
            canvasHeight = canvasWidth / aspect;
            if (canvasHeight > windowHeight) {
                canvasHeight = windowHeight;
                canvasWidth = canvasHeight * aspect;
                padding = (windowWidth - canvasWidth) / 2;
            }

            var paddingHeight = (windowHeight - canvasHeight - FOOTER) / 2;
            ctx.canvas.width = canvasWidth;
            ctx.canvas.height= canvasHeight;
            canvas.css('margin-left', padding + 'px');
            canvas.css('margin-right', padding + 'px');
            canvas.css('background', 'rgb(255,255,255)');
            canvas.css('margin-top', paddingHeight + 'px');

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
            var pickerWidth = colorPicker.outerWidth();
            colorPicker.css('marginLeft', (panelWidth - pickerWidth) / 2);
        }


        function initRightPanel() {
            var rightPanel = $('#right-panel');
            var panelWidth = (windowWidth - ctx.canvas.width) / 2;
            var panelHeight = rightPanel.height()
            rightPanel.css('width', panelWidth + 'px');

            // Brush selector.
            var brushPicker = $('#brush-picker');
            var pickerWidth = panelWidth * .80;
            brushPicker.css('width', pickerWidth);
            brushPicker.css('height', panelHeight * 2 / 3);
            brushPicker.css('marginLeft', (panelWidth - pickerWidth) / 2);

            // Brush options widget toolbar.
            var brushOptions = $('#brush-options');
            var optionsWidth = panelWidth * .80;
            brushOptions.css('width', optionsWidth);
            brushOptions.css('height', panelHeight / 4);
            brushOptions.css('marginLeft', (panelWidth - pickerWidth) / 2);

            $('#brushSize').html(DEFAULT_BRUSH_SIZE);
            var updateBrushSize = function(value) {
                $('#brushSize').html(value);
                brushSize = value;
            };
            var sizeSlider = $('#brushSizer').slider({
                min: 1, max: 120, value: 5,
                slide: function(event, ui) { updateBrushSize(ui.value); },
                change: function(event, ui) { updateBrushSize(ui.value); }
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


        function swap_brush(brush) {
            canvas.mousedown(brush.mousedown);
            canvas.mouseup(brush.mouseup);
            canvas.mousemove(brush.mousemove);
            canvas.get(0).ontouchstart = brush.touch;
            canvas.get(0).ontouchmove = brush.touch;
        };


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


        function brushPencilPoint() {
            var brush = this;
            this.started = false;

            this.mousedown = function(e) {
                e.preventDefault();
                brush.started = true;
                ctx.fillStyle = color;
                ctx.fillRect (e.pageX - this.offsetLeft, e.pageY - this.offsetTop, brushSize, brushSize);
            };

            this.mouseup = function(e) {
                brush.started = false
            };

            this.mousemove = function(e) {
                e.preventDefault();
                if (brush.started) {
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
    }


    draw_nothing = new draw_nothing();
    draw_nothing.init();
});
