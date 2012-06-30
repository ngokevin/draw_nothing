$(document).ready(function (){

    function dbg(str) { console.log(str); }

    var windowWidth = $(window).width();
    var windowHeight= $(window).height();
    var minDesktop = 800;
    var minMobile= 320;
    var FOOTER = 50;
    var CANVAS_PADDING = 30;
    var PANEL_WIDTH = windowWidth / 5;

    // prevent scrolling on touch devices
    document.body.addEventListener('touchmove', function(e) {
        event.preventDefault();
    }, false);


    function draw_nothing() {
        var canvas;
        var ctx;

        var brush = new brushPencilPoint();
        var r = 230, g = 0, b = 0, brushOpacity = 1;
        var color; updateColor();
        var brushSize = 5;

        this.init = function() {
            initCanvas();
            initLeftPanel();
            initImgLoader();

            // Set default brush.
            swap_brush(brush);
        };


        function initCanvas() {
            var aspect = 4 / 3;
            var leftPadding = windowWidth / 5;
            var canvasWidth, canvasHeight, padding;

            canvas = $('#canvas');
            ctx = canvas.get(0).getContext('2d');

            // If mobile, fit canvas width to screen.
            if (windowWidth <= minDesktop) {
                canvasWidth = windowWidth
                leftPadding = 0;
            }
            // If desktop, fit canvas according to canvasPaddingAspect.
            else {
                // padding + canvas = width; aspect = canvas / padding.
                canvasWidth = windowWidth - leftPadding;
            }
            // Readjust height if needed.
            canvasHeight = canvasWidth / aspect;
            if (canvasHeight > windowHeight) {
                canvasHeight = windowHeight;
                canvasWidth = canvasHeight * aspect;
                leftPadding = windowWidth - canvasWidth;
            }

            ctx.canvas.width = canvasWidth - CANVAS_PADDING;
            ctx.canvas.height= canvasHeight - CANVAS_PADDING - FOOTER;
            canvas.css('margin-left', leftPadding + CANVAS_PADDING / 2 + 'px');
            canvas.css('background', 'rgb(255,255,255)');
            var paddingHeight = windowHeight - ctx.canvas.height - FOOTER - CANVAS_PADDING / 2 - 5;
            canvas.css('margin-top', paddingHeight + 'px');

            // Give canvas an img link.
            var dataURL = canvas.get(0).toDataURL();
            $('#canvas-img').attr('src', dataURL);
        }


        function initLeftPanel() {
            var leftPanel = $('#left-panel');
            leftPanel.css('width', PANEL_WIDTH + 'px');
            var panelHeight = leftPanel.height() - FOOTER
            leftPanel.css('height', panelHeight + 'px');

            // Color picker, sets color to selected value using callback.
            c = ColorPicker(
                document.getElementById('slide'),
                document.getElementById('picker'),
                function(hex, hsv, rgb, mousePicker, mouseSlide) {
                    r = rgb['r'], g = rgb['g'], b = rgb['b'];
                    updateColor();
                    ColorPicker.positionIndicators(
                        $('.slide-indicator')[0],
                        $('.picker-indicator')[0],
                        mouseSlide, mousePicker
                    );
                }
            );

            var colorPicker = $('.color-picker');
            var pickerWidth = colorPicker.outerWidth();
            colorPicker.css('marginLeft', (PANEL_WIDTH - pickerWidth) / 2);

            // Brush selector.
            var brushPicker = $('#brush-picker');
            var pickerWidth = PANEL_WIDTH * .80;
            brushPicker.css('width', pickerWidth);
            brushPicker.css('height', panelHeight / 4);
            brushPicker.css('marginLeft', (PANEL_WIDTH - pickerWidth) / 2);

            // Brush options widget toolbar.
            var brushOptions = $('#brush-options');
            var optionsWidth = PANEL_WIDTH * .80;
            brushOptions.css('width', optionsWidth);
            brushOptions.css('height', panelHeight / 4);
            brushOptions.css('marginLeft', (PANEL_WIDTH - pickerWidth) / 2);

            // Brush size slider.
            $('#brushSize').html(brushSize);
            var updateBrushSize = function(value) {
                $('#brushSize').html(value);
                brushSize = value;
            };
            var sizeSlider = $('#brushSizer').slider({
                min: 1, max: 120, value: brushSize,
                slide: function(event, ui) { updateBrushSize(ui.value); },
                change: function(event, ui) { updateBrushSize(ui.value); }
            });

            // Brush opacity slider.
            $('#brushSize').html(brushSize);
            $('#brushOpacity').html(brushOpacity);
            var updateBrushOpacity = function(value) {
                $('#brushOpacity').html(value);
                brushOpacity = value;
            };
            var opacitySlider = $('#brushOpacityer').slider({
                min: 0, max: 1, value: 1, step: .01,
                slide: function(event, ui) { updateBrushOpacity(ui.value); },
                change: function(event, ui) { updateBrushOpacity(ui.value); },
                stop: function(event, ui) {
                    updateColor();
                }
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


        // Takes the r, g, b, opacity variables to build an rgba.
        function updateColor() {
            color = ('rgba(' + parseInt(r) + ', ' + parseInt(g) + ', '
                     + parseInt(b) + ', ' + brushOpacity + ')');
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
