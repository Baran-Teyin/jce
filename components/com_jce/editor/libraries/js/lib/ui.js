(function ($) {
    $.fn.borderWidget = function () {
        $(this).on('click change', function () {
            var state = this.checked;

            $(this).parents('.uk-form-controls').find(':input').not(this).toggleClass('uk-text-muted', !state).attr('disabled', function () {
                return !state ? true : null;
            });

            $(this).trigger('border:change');
        }).trigger('change');

        return this;
    };

    $.fn.checkbox = function () {
        return this.each(function () {
            var self = this;

            if ($(this).hasClass('uk-form-constrain')) {
                return this;
            }

            $(this).wrap('<i class="uk-checkbox" />').on('click', function () {
                $(this).parent().toggleClass('uk-icon-check', this.checked);
            }).on('checkbox:check', function () {
                $(this).parent().toggleClass('uk-icon-check', self.checked);
            }).parent().toggleClass('uk-icon-check', self.checked).css('margin-top', $(self).parent().height() / 2);
        });
    };

    $.fn.equalize = function () {
        return this.each(function () {
            var x = 0,
                cb = this,
                $elms = $(this).parents('.uk-form-equalize').find('input[type="text"]'),
                self = this;

            // add icon and click
            $(self).on('click', function () {
                var state = this.checked;

                //$(this).parent('.uk-icon-lock').toggleClass('uk-icon-unlock-alt', !state);

                $elms.slice(1).prop('disabled', state).prev('label').toggleClass('uk-text-muted', state);

                if (state) {
                    var value = $elms.first().val();

                    $elms.slice(1).val(value).trigger('change');

                    $(cb).trigger('equalize:change', [$elms.addBack()]);
                }
            });

            /*if ($(self).parent('label').length === 0) {
                $(self).wrap('<i class="uk-equalize uk-icon-lock" />');
            }*/

            $elms.first().on('change', function () {
                var state = $(self).prop('checked');

                if (state) {
                    $elms.not(this).val(this.value).trigger('change');
                }

                // trigger event
                $(cb).trigger('equalize:change', [$elms.addBack()]);
            });

            $(this).on('equalize:update', function () {
                // get first value
                var value = $elms.first().val();

                $elms.each(function () {
                    if ($(this).val() === value) {
                        x++;
                    }
                });

                // state
                var state = (x === $elms.length);

                $elms.slice(1).prop('disabled', state).prev('label').toggleClass('uk-text-muted', state);

                // check
                $(this).prop('checked', state); //.parent('.uk-icon-lock').toggleClass('uk-icon-unlock-alt', !state);
            });
        });
    };

    $.fn.constrain = function () {
        return this.each(function () {
            var cb = this,
                $elms = $(this).parents('.uk-form-constrain').find('input[type="text"], input[type="number"]');

                $(this).parent('label').addClass('uk-constrain-label');

            $(this).on('constrain:update', function () {
                $(this).parents('.uk-form-constrain').find('input[type="text"], input[type="number"]').each(function () {
                    $(this).data('tmp', this.value);
                });
            });

            $(this).parents('.uk-form-constrain').toggleClass('uk-constrain-active', this.checked);

            $(cb).on('click', function () {
                $(this).parents('.uk-form-constrain').toggleClass('uk-constrain-active', this.checked);
            });

            $(cb).parent().append('<i class="uk-icon-lock" role="presentation"></i><i class="uk-icon-unlocked" role="presentation"></i>');

            // set tmp values
            $elms.each(function () {
                $(this).data('tmp', this.value);
            }).on('change', function (e) {
                e.stopPropagation();

                var a = this,
                    $elms = $(this).parents('.uk-form-constrain').find('input'),
                    b = $elms.not(':checkbox').not(this),
                    cb = $elms.filter(':checkbox');

                var w = $(a).val(),
                    h = $(b).val(),
                    tw = $(a).data('tmp');

                // trigger change
                $(cb).trigger('constrain:change', [$elms]);

                if (w && h && tw) {
                    // ignore percentage values
                    if (w.indexOf('%') !== -1 || h.indexOf('%') !== -1) {
                        return;
                    }

                    // if constrain is on
                    if ($(cb).is(':checked')) {
                        var temp = ((h / tw) * w).toFixed(0);
                        $(b).val(temp).data('tmp', temp);
                    }
                }

                $(a).data('tmp', w);
            });
        });
    };

    $.fn.repeatable = function () {
        return this.each(function () {
            var self = this;

            if ($(this).data('uk-repeatable')) {
                return this;
            }

            $(this).data('uk-repeatable', 1);

            function clone() {
                // clone element
                var el = $(self).clone(true, true);

                // clear inputs
                $(el).find('input').val('');

                $(self).trigger('repeatable:create', [self, $(el).get(0)]);

                // add new element
                $(el).insertAfter($(self).siblings('.uk-repeatable').add(self).last());
            }

            $('.uk-repeatable-create', this).on('click', function (e) {
                clone();
                e.preventDefault();
            });

            $('.uk-repeatable-delete', this).on('click', function (e) {
                $(this).parent().parent().remove();

                e.preventDefault();
            });

            $(self).on('repeatable:clone', function (e, count) {
                for (var i = 0; i < count; i++) {
                    clone();
                }
            });
        });
    };

    $.fn.button = function (options, key, value) {
        options = options || {};

        var map = {
            "uk-icon-circle-arrow-w": "uk-icon-refresh",
            "uk-icon-arrowreturnthick-1-w": "uk-icon-undo",
            "uk-icon-circle-check": "uk-icon-check",
            "uk-icon-check": "uk-icon-check",
            "uk-icon-closethick": "uk-icon-close"
        };

        return this.each(function () {
            // jQuery UI legacy
            if (typeof options === "string") {
                if (options === "option" && key && value) {
                    if (key === "label") {
                        $('.uk-button-text', this).text(value);
                    }
                }

                if (options === "enable") {
                    $(this).prop('disabled', false);
                }

                if (options === "disable") {
                    $(this).prop('disabled', true);
                }

                // end here so as not to re-create the button
                return this;
            }
            // add button classes
            $(this).addClass('uk-button').addClass(options.classes || "");
            // add icon
            $(this).html('<span class="uk-button-text">' + $(this).text() + '</span>');

            if (options.icons && options.icons.primary) {
                var icon = map[options.icons.primary] || options.icons.primary || "";

                $('<i />').addClass('uk-margin-small-right uk-icon ' + icon).prependTo(this);
            }
        });
    };

    $.fn.tabs = function (options, key, value) {
        return this.each(function () {

            var el = this;

            // jQuery UI legacy
            if (typeof options === "string") {
                // end here so as not to re-create the tabs
                return this;
            }

            if ($(this).data('tabs')) {
                return this;
            }

            $(this).addClass('uk-tabs');

            $(this).children('ul').addClass('uk-tab');

            if ($(this).children('.uk-switcher').length === 0) {
                $('<div class="uk-switcher" />').append($(this).children('div')).appendTo(this);
            }

            $(this).children('.uk-switcher').addClass('uk-tabs-panel').children().first().addClass('uk-active').attr('aria-hidden', false);

            $('.uk-tab li', el).on('click', function (e) {
                e.preventDefault();

                $(this).find('button').trigger('focus');

                // legacy
                $(el).children('.uk-switcher').children().addClass('uk-tabs-hide');

                // get current active panel
                var panel = $(el).children('.uk-switcher').children('.uk-active').get(0);

                // get current active tab
                var tab = $(el).children('.uk-tab').children('.uk-active').get(0);

                // trigger tab event
                $(el).trigger('tabs.beforeactivate', [tab, panel]);

                // toggle all tabs and panels
                $(el).children('.uk-tab').children().removeClass('uk-active').attr('aria-selected', false);
                $(el).children('.uk-switcher').children().removeClass('uk-active').attr('aria-hidden', true);

                // activate tab
                $(this).addClass('uk-active').attr('aria-selected', true);

                // activate new panel
                var panel = $(el).children('.uk-switcher').children().eq($(this).index()).addClass('uk-active').removeClass('uk-tabs-hide').attr('aria-hidden', false).get(0);

                // trigger tab event
                $(el).trigger('tabs.activate', [this, panel]);

                // kill default events
                e.preventDefault();
            }).first().addClass('uk-active').attr('aria-selected', true).find('button').trigger('focus');

            $('body').on('keydown.tabs', function (e) {

                if ($(e.target).hasClass('uk-button-tab')) {
                    if (e.keyCode >= 37 && e.keyCode <= 40) {
                        var parent = e.target.parentNode, $tabItems = $(parent).siblings().addBack();

                        var endIndex = Math.max(0, $tabItems.length - 1), idx = $tabItems.index(parent);

                        if (e.keyCode === 37 || e.keyCode === 38) {
                            idx--;
                        }

                        if (e.keyCode === 39 || e.keyCode === 40) {
                            idx++;
                        }

                        if (idx > endIndex) {
                            idx = 0;
                        }

                        if (idx < 0) {
                            idx = endIndex;
                        }

                        $tabItems.eq(idx).trigger('click');

                        e.preventDefault();
                    }
                }
            });

            $(this).data('tabs', true);
        });
    };

    $.fn.accordion = function (options, key, value) {
        var el = this,
            hidden = {
                'height': 0,
                'position': 'relative',
                'overflow': 'hidden'
            };

        // jQuery UI legacy
        if (typeof options === "string") {
            if (options === "activate" && typeof key !== "undefined") {
                $('.uk-accordion-title', this).trigger('click');
            }
            // end here so as not to re-create the button
            return this;
        }

        //options = $.extend({index: 0}, options || {});

        $(this).children('h3').addClass('uk-accordion-title').next('div').addClass('uk-accordion-content').css(hidden);

        $('.uk-accordion-title', this).on('click', function (e) {
            e.preventDefault();

            var tab = this;

            // collapse all content
            $('.uk-accordion-content', el).height(0);
            // deactivate title
            $('.uk-accordion-title', el).removeClass('uk-active');

            $(this).addClass('uk-active').next('div').css('height', function (i, v) {
                if (parseInt(v) === 0) {
                    $(el).trigger('accordion.activate', [tab, this]);
                    return 'auto';
                }

                return 0;
            });
        });

        if ($.isPlainObject(options)) {
            if (typeof options.beforeActivate === "function") {
                $(this).on('accordion:activate', function (e, tab) {
                    var ui = {
                        "newHeader": tab
                    };
                    options.beforeActivate(e, ui);
                });
            }
        }

        // reset
        $(this).on('accordion:reset', function (e) {
            // collapse all content
            $('.uk-accordion-content', el).height(0);
            // deactivate title
            $('.uk-accordion-title', el).removeClass('uk-active');
        });

        return this;
    };

    $.fn.dialog = function () {
        return this;
    };
})(jQuery);