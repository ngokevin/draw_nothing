$(document).ready(function (){

    function dbg(str) { console.log(str); }

    var windowWidth = $(window).width();
    var windowHeight= $(window).height();

    var minDesktop = 1025;
    var minTablet = 641;
    var minMobile= 320;

    var DESKTOP = windowWidth > minDesktop;
    var TABLET = windowWidth > minTablet && !DESKTOP;
    var MOBILE = (windowWidth > minMobile && !TABLET && !DESKTOP) || windowHeight < minTablet;

    var FOOTER = 50;
    var PANEL_WIDTH = 280;

    // prevent scrolling on touch devices
    document.body.addEventListener('touchmove', function(e) {
        event.preventDefault();
    }, false);


    function draw_nothing() {
        var canvas;
        var ctx;

        var brush = new brushPencilPoint();

        var r = 230, g = 0, b = 0;
        var bOpts = {
            color: '',
            size: 5,
            opacity: 1
        };
        updateColor()

        var lastClickedButton = '';

        this.init = function() {
            if (DESKTOP) { dbg('desktop') };
            if (TABLET) { dbg('tablet') };
            if (MOBILE) { dbg('mobile') };

            initCanvas();
            initMenu();
            initLeftPanel();
            initMenuButton($('#color-picker-button'), $('#color-picker-menu'));
            initMenuButton($('#brush-picker-button'), $('#brush-picker-menu'));
            initMenuButton($('#brush-options-button'), $('#brush-options-menu'));
            initImgLoader();
            swapBrush(brush);
        };


        function initCanvas() {
            var leftPadding = PANEL_WIDTH;
            var canvasWidth, canvasHeight, canvasPadding= 30;

            if (windowWidth - PANEL_WIDTH > windowHeight) {
                var aspect = 4 / 3;
            }
            else {
                var aspect = 3 / 4;
            }
            canvas = $('#canvas');
            ctx = canvas.get(0).getContext('2d');

            // If mobile, fit canvas width to screen.
            if (MOBILE) {
                canvasPadding = 0;
                canvasWidth = windowWidth;
                canvasHeight = windowHeight;
            }
            // If desktop, fit canvas according to canvasPaddingAspect.
            else {
                // padding + canvas = width; aspect = canvas / padding.
                canvasWidth = windowWidth - leftPadding;
                // Readjust canvas if height is too large.
                canvasHeight = canvasWidth / aspect;
                if (canvasHeight > windowHeight) {
                    canvasHeight = windowHeight;
                    canvasWidth = canvasHeight * aspect;
                    // Make up for difference in shrunken width.
                    leftPadding += (windowWidth - PANEL_WIDTH - canvasWidth) / 2;
                }
            }

            ctx.canvas.width = canvasWidth - canvasPadding;
            ctx.canvas.height= canvasHeight - canvasPadding - FOOTER;

            var paddingWidth = leftPadding + canvasPadding / 2;
            var paddingHeight = (windowHeight - ctx.canvas.height - FOOTER - canvasPadding / 2) / 2 + 5;
            if (MOBILE) {
                paddingWidth= 0;
                paddingHeight = 0;
            }

            canvas.css('margin-left', paddingWidth + 'px');
            canvas.css('background', 'rgb(255,255,255)');
            canvas.css('margin-top', paddingHeight + 'px');

            // Give canvas an img link.
            var dataURL = canvas.get(0).toDataURL();
            $('#canvas-img').attr('src', dataURL);
        }


        function initMenu() {
            var menu = $('#menu');
            var menuWidth = menu.width();
            menu.css('left', (windowWidth - menuWidth) / 2);

            var menuHeight = menu.height();
            menu.css('height', menuHeight - FOOTER + 'px');
            menu.css('top', (windowHeight - menuHeight) / 2);

            initColorPicker(document.getElementById('slide-menu'), document.getElementById('picker-menu'));
            var colorPicker = $('#color-picker-menu');
            colorPicker.css('marginLeft', (menuWidth - colorPicker.outerWidth()) / 2);

            // Label, slider.
            initSizeSlider($('#brushSizeMenu'), $('#brushSizerMenu'));
            initOpacitySlider($('brushOpacityMenu'), $('#brushOpacityerMenu'));

            // Hide menu until called upon.
            var brushMenus = $('#brushOptionsMenu');
            brushMenus.hide();
            brushMenus.css('visibility', 'visible');
            menu.hide()
            menu.css('visibility', 'visible');
        }


        function initLeftPanel() {
            var leftPanel = $('#left-panel');

            if (MOBILE) {
                leftPanel.hide();
                return;
            }

            leftPanel.css('width', PANEL_WIDTH + 'px');
            var panelHeight = leftPanel.height() - FOOTER
            leftPanel.css('height', panelHeight + 'px');

            // Color selector.
            initColorPicker(document.getElementById('slide'), document.getElementById('picker'));
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

            initSizeSlider($('#brushSize'), $('#brushSizer'));
            initSizeSlider($('#brushOpacity'), $('#brushOpacityer'));

        }


        function initColorPicker(slide, picker) {
            // Color picker, sets color to selected value using callback.
            return ColorPicker(
                slide, picker,
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
        }


        function initSizeSlider(label, slider) {
            // Brush size slider.
            label.html(bOpts['size']);
            var updateBrushSize = function(value) {
                label.html(value);
                bOpts['size'] = value;
            };
            return slider.slider({
                min: 1, max: 120, value: bOpts['size'],
                slide: function(event, ui) { updateBrushSize(ui.value); },
                change: function(event, ui) { updateBrushSize(ui.value); }
            });
        }


        function initOpacitySlider(label, slider) {
            // Brush opacity slider.
            label.html(bOpts['opacity']);
            var updateBrushOpacity = function(value) {
                label.html(value);
                bOpts['opacity'] = value;
            };
            return slider.slider({
                min: 0, max: 1, value: 1, step: .01,
                slide: function(event, ui) { updateBrushOpacity(ui.value); },
                change: function(event, ui) { updateBrushOpacity(ui.value); },
                stop: function(event, ui) {
                    updateColor();
                }
            });
        }


        function initMenuButton(button, pickerMenu) {
            var menuItems = $('.menu-item');
            var menu = $('#menu');

            // Close menu if same button is clicked, show different menu if
            // another button clicked.
            button.click(function() {
                if (button.selector == lastClickedButton) {
                    menu.hide();
                    lastClickedButton = '';
                } else {
                    menuItems.hide();
                    menu.show()
                    pickerMenu.show();
                    lastClickedButton = button.selector;
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


        function swapBrush(brush) {
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
            bOpts['color'] = ('rgba(' + parseInt(r) + ', ' + parseInt(g) + ', '
                     + parseInt(b) + ', ' + bOpts['opacity'] + ')');
            $('#color-picker-button').css('color', bOpts['color']);
        }


        function brushPencilPoint() {
            var brush = this;
            this.started = false;

            this.mousedown = function(e) {
                e.preventDefault();
                brush.started = true;
                ctx.fillStyle = bOpts['color'];
                ctx.fillRect (e.pageX - this.offsetLeft, e.pageY - this.offsetTop, bOpts['size'], bOpts['size']);
            };

            this.mouseup = function(e) {
                brush.started = false
            };

            this.mousemove = function(e) {
                e.preventDefault();
                if (brush.started) {
                    ctx.fillStyle = bOpts['color'];
                    ctx.fillRect(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, bOpts['size'], bOpts['size']);
                }
            };

            this.touch = function(e) {
                ctx.fillStyle = bOpts['color'];
                for (var i = 1; i <= e.touches.length; i++) {
                    var p = getCoords(e.touches[i - 1], this);
                    ctx.fillRect(p.x - this.offsetLeft, p.y - this.offsetTop, bOpts['size'], bOpts['size']);
                }
            };
       }
    }


    draw_nothing = new draw_nothing();
    draw_nothing.init();
});
