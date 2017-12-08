(function(PD, ua) {

    var
        // Better testing of touch support
   
        isChrome = /chrome/i.exec(ua),
        isAndroid = /android/i.exec(ua),
        hasTouch = 'ontouchstart' in window && !(isChrome && !isAndroid);

    /**
     * PD.fn.ripple
     * @param {Object} options
     * @param {String} [options.color=#fff] The ripple effect color
     */
    PD.fn.ripple = function(options) {
        var rippled = false,
            opts = PD.extend({}, { color: '#fff' }, options);
        opts.event = (hasTouch && 'touchstart.ripple') || 'mousedown.ripple';
        opts.end_event = (hasTouch && 'touchend.ripple touchcancel.ripple') || 'mouseup.ripple mouseleave.ripple';

        PD(this)
            // Bind the event to run the effect
            .on(opts.event, function(ev) {
                var x, y, touch_ev,
                    PDpaper = PD(this),
                    PDink = PD('<div/>'),
                    size = Math.max(PDpaper.width(), PDpaper.height());

                rippled = true;

                // Set up ripple effect styles
                PDpaper
                    .trigger('beforeripple')
                    .addClass('ripple-active');
                PDink
                    .addClass('ripple-effect')
                    .css({height: size, width: size});

                // get click coordinates
                // logic = click coordinates relative to page
                // - position relative to page - half of self height/width to make it controllable from the center
                touch_ev = hasTouch ? ev.originalEvent.touches[0] : ev;
                x = touch_ev.pageX - PDpaper.offset().left - PDink.width()/2;
                y = touch_ev.pageY - PDpaper.offset().top - PDink.height()/2;

                // Set up ripple position and place it in the DOM
                PDink
                    .css({top: y + 'px', left: x + 'px', backgroundColor: opts.color})
                    .appendTo(PDpaper);
            })
            // Bind the event to end the paper-press ripple
            .on(opts.end_event, function() {
                var PDpaper = PD(this),
                    PDink = PDpaper.find('.ripple-effect');

                // We don't want to run the afterripple
                // events if the user hasn't started a ripple
                if (!rippled) {
                    return;
                }
                rippled = false;

                // Remove ripple effect styles
                PDpaper
                    .trigger('afterripple')
                    .removeClass('ripple-active');
                PDink
                    .css({backgroundColor: 'transparent'})
                    .one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function() {
                        PDink.remove();
                    });
            });

        // Chaining
        return PD(this);
    };

}(window.PD, navigator.userAgent));