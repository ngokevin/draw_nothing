$(document).ready(function (){

    function dbg(str) { console.log(str); }

    var userAgent = navigator.userAgent;
    var windowWidth = $(window).width();
    var windowHeight= $(window).height();

    // Window height in Firefox Mobile is weird.
    if (userAgent.indexOf('Firefox') > -1 && userAgent.indexOf('Mobile') > -1) {
        windowHeight *= .665;
    }

    var minDesktop = 960;
    var minMobile= 320;

    var DESKTOP = windowWidth > minDesktop;
    var MOBILE = (windowWidth > minMobile && !DESKTOP) || windowWidth < minDesktop;

    var HEADER = 0;
    if (MOBILE)
        var HEADER = 30;
    var FOOTER = 50;
    var PANEL_WIDTH = 280;

    // Prevent scrolling on touch devices.
    $('#canvas').on("touchmove", false);
    $('#canvas').on("touchstart", false);

    function draw_nothing() {
        var canvas;
        var ctx;

        var brush = new brushPencilPoint();

        var colorwheel = null, colorwheelMenu = null;

        var r = 230, g = 0, b = 0;
        var bOpts = {
            color: null,
            size: 20,
            opacity: .6,
        };
        updateColor()

        var lastClickedButton = '';

        this.init = function() {
            if (DESKTOP) { dbg('desktop') };
            if (MOBILE) { dbg('mobile') };

            initCanvas();
            initColorPicker();
            initMenu();
            initSizeSlider($('#brushSize'), $('#brushSizer'));
            initOpacitySlider($('#brushOpacity'), $('#brushOpacityer'));
            initMenuButton($('#color-picker-button'), $('#color-picker-menu'));
            initMenuButton($('#brush-picker-button'), $('#brush-picker-menu'));
            initMenuButton($('#brush-options-button'), $('#brush-options-menu'));
            initImgLoader();
            swapBrush(brush);
            adjustWindow();

            window.onresize = adjustWindow;

            // Don't show until rendered.
            $(document.body).css('visibility', 'visible');
        };


        function adjustWindow() {
            windowWidth = $(window).width();
            windowHeight = $(window).height();
            canvas.css('margin-left', 225 + (windowWidth - canvas.width() - 225) / 2);
        }


        function initCanvas() {
            canvas = $('#canvas');
            ctx = canvas.get(0).getContext('2d');
            ctx.canvas.width = canvas.width();
            ctx.canvas.height = canvas.height();

            // Give canvas an img link.
            var dataURL = canvas.get(0).toDataURL();
            $('#canvas-img').attr('src', dataURL);
        }




        function initMenu() {
            var menu = $('#menu');
            var menuWidth = menu.width();
            menu.css('left', (windowWidth - menuWidth) / 2);

            var menuHeight = menu.height() - FOOTER - HEADER;
            menu.css('height', menuHeight + 'px');
            menu.css('top', (windowHeight - HEADER - FOOTER - menuHeight) / 2 + HEADER);

            var colorPicker = $('#colorwheel-menu');
            colorPicker.css('marginLeft', (menuWidth - colorPicker.outerWidth()) / 2);

            // Label, slider.
            var brushSizerMenu = $('#brushSizerMenu');
            initSizeSlider($('#brushSizeMenu'), brushSizerMenu);
            initOpacitySlider($('#brushOpacityMenu'), $('#brushOpacityerMenu'));

            var sliderWidth = brushSizerMenu.width()
            $('.brush-option-menu').css('width', '85%');
            $('.brush-option-menu').css('paddingLeft', (menuWidth - sliderWidth) / 2);
            $('.slider-val-menu').css('marginLeft', sliderWidth);

            // Hide menu until called upon.
            menu.hide()
            menu.css('visibility', 'visible');
        }


        function initColorPicker(element, cw) {
            try {
                colorwheel = Raphael.colorwheel($('#colorwheel')[0], 200, 60);
                colorwheelMenu = Raphael.colorwheel($('#colorwheel-menu')[0], 200, 60);

                colorwheel.color(rgbToHex(r, g, b));
                colorwheelMenu.color(rgbToHex(r, g, b));
                $('#color-picker-icon').css('color', bOpts['color'])

                colorwheel.onchange(function(color) {
                    r = parseInt(color.r); b = parseInt(color.b); g = parseInt(color.g);
                    updateColor();
                    colorwheelMenu.color(rgbToHex(r, g, b));
                    $('#color-picker-icon').css('color', bOpts['color'])
                });

                colorwheelMenu.onchange(function(color) {
                    r = parseInt(color.r); b = parseInt(color.b); g = parseInt(color.g);
                    updateColor();
                    colorwheel.color(rgbToHex(r, g, b));
                    $('#color-picker-icon').css('color', bOpts['color'])
                });
            }
            // Create canvas-based color picker if Raphael not compatible.
            catch (err) {
                $('#color-picker-icon').css('color', bOpts['color'])
                colorwheel =  $('#colorwheel-menu');
                colorwheel.css('position', 'absolute');
                colorwheel.css('width', windowWidth / 1.5 + 'px');
                colorwheel.css('height', windowHeight / 3 + 'px');
                $('#colorwheel-menu').CanvasColorPicker({
                    flat: true,
                    showButtons: false, showPreview: false,
                    showHSB: false, showColor: false,
                    color: {r: r, g: g, b: b},
                    onColorChange: function(rgb, hsv) {
                        r = parseInt(rgb.r); g = parseInt(rgb.g); b = parseInt(rgb.b);
                        updateColor();
                        $('#color-picker-icon').css('color', bOpts['color'])
                    }
                });
            }
        }


        function componentToHex(c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }
        function rgbToHex(r, g, b) {
            return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
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
            var updateBrushOpacity = function(value) {
                label.html((value + '').replace(/^[0]+/g, ''));
                bOpts['opacity'] = value;
            };
            updateBrushOpacity(bOpts['opacity']);
            return slider.slider({
                min: .01, max: 1, value: bOpts['opacity'], step: .01,
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
            $('#img-loader-button').click(function() {
                var url = prompt('Background image loader.\nInput image url.');
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
