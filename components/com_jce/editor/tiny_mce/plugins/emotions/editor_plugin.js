/**
 * @package   	JCE Emotions
 * @copyright 	Copyright (c) 2009-2018 Ryan Demmer. All rights reserved.
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses.
 */
(function () {
    var DOM = tinymce.DOM,
        Event = tinymce.dom.Event,
        each = tinymce.each;

    // https://en.wikipedia.org/wiki/Emoticons_(Unicode_block)    
    var emoji = [
        {"😀":"grinning_face"},
        {"😁":"grinning_face_with_smiling_eyes"},
        {"😂":"face_with_tears_of_joy"},
        {"😃":"smiling_face_with_open_mouth"},
        {"😄":"smiling_face_with_open_mouth_and_smiling_eyes"},
        {"😅":"smiling_face_with_open_mouth_and_cold_sweat"},
        {"😆":"smiling_face_with_open_mouth_and_tightly_closed_eyes"},
        {"😇":"smiling_face_with_halo"},
        {"😈":"smiling_face_with_horns"},
        {"😉":"winking_face"},
        {"😊":"smiling_face_with_smiling_eyes"},
        {"😋":"face_savouring_delicious_food"},
        {"😌":"relieved_face"},
        {"😍":"smiling_face_with_heart_shaped_eyes"},
        {"😎":"smiling_face_with_sunglasses"},
        {"😏":"smirking_face"},
        {"😐":"neutral_face"},
        {"😑":"expressionless_face"},
        {"😒":"unamused_face"},
        {"😓":"face_with_cold_sweat"},
        {"😔":"pensive_face"},
        {"😕":"confused_face"},
        {"😖":"confounded_face"},
        {"😗":"kissing_face"},
        {"😘":"face_throwing_a_kiss"},
        {"😙":"kissing_face_with_smiling_eyes"},
        {"😚":"kissing_face_with_closed_eyes"},
        {"😛":"face_with_stuck_out_tongue"},
        {"😜":"face_with_stuck_out_tongue_and_winking_eye"},
        {"😝":"face_with_stuck_out_tongue_and_tightly_closed_eyes"},
        {"😞":"disappointed_face"},
        {"😟":"worried_face"},
        {"😠":"angry_face"},
        {"😡":"pouting_face"},
        {"😢":"crying_face"},
        {"😣":"persevering_face"},
        {"😤":"face_with_look_of_triumph"},
        {"😥":"disappointed_but_relieved_face"},
        {"😦":"frowning_face_with_open_mouth"},
        {"😧":"anguished_face"},
        {"😨":"fearful_face"},
        {"😩":"weary_face"},
        {"😪":"sleepy_face"},
        {"😫":"tired_face"},
        {"😬":"grimacing_face"},
        {"😭":"loudly_crying_face"},
        {"😮":"face_with_open_mouth"},
        {"😯":"hushed_face"},
        {"😰":"face_with_open_mouth_and_cold_sweat"},
        {"😱":"face_screaming_in_fear"},
        {"😲":"astonished_face"},
        {"😳":"flushed_face"},
        {"😴":"sleeping_face"},
        {"😵":"dizzy_face"},
        {"😶":"face_without_mouth"},
        {"😷":"face_with_medical_mask"},
        {"😸":"grinning_cat_face_with_smiling_eyes"},
        {"😹":"cat_face_with_tears_of_joy"},
        {"😺":"smiling_cat_face_with_open_mouth"},
        {"😻":"smiling_cat_face_with_heart_shaped_eyes"},
        {"😼":"cat_face_with_wry_smile"},
        {"😽":"kissing_cat_face_with_closed_eyes"},
        {"😾":"pouting_cat_face"},
        {"😿":"crying_cat_face"},
        {"🙀":"weary_cat_face"},
        {"🙁":"slightly_frowning_face"},
        {"🙂":"slightly_smiling_face"},
        {"🙃":"upside_down_face"},
        {"🙄":"face_with_rolling_eyes"},
        {"🙅":"face_with_no_good_gesture"},
        {"🙆":"face_with_ok_gesture"},
        {"🙇":"person_bowing_deeply"},
        {"🙈":"see_no_evil_monkey"},
        {"🙉":"hear_no_evil_monkey"},
        {"🙊":"speak_no_evil_monkey"},
        {"🙋":"happy_person_raising_one_hand"},
        {"🙌":"person_raising_both_hands_in_celebration"},
        {"🙍":"person_frowning"},
        {"🙎":"person_with_pouting_face"},
        {"🙏":"person_with_folded_hands"}
    ];

    if (tinymce.isIE8) {
        emoji = [
            'smiley-confused.gif',
            'smiley-cool.gif',
            'smiley-cry.gif',
            'smiley-eek.gif',
            'smiley-embarassed.gif',
            'smiley-evil.gif',
            'smiley-laughing.gif',
            'smiley-mad.gif',
            'smiley-neutral.gif',
            'smiley-roll.gif',
            'smiley-sad.gif',
            'smiley-surprised.gif',
            'smiley-tongue_out.gif',
            'smiley-wink.gif',
            'smiley-yell.gif',
            'smiley-smile.gif'
        ];
    }

    tinymce.create("tinymce.plugins.EmotionsPlugin", {
        init: function (ed, url) {
            var self = this;

            this.editor = ed;
            this.url = url;

            ed.addButton("emotions", {
                title: "emotions.desc",
                cmd: "mceEmotion"
            });

            self.content = "";

            function createEmojiContent(icons) {
                var content = document.createElement('div');
                
                each(icons, function (o) {
                    if (typeof o === "string") {
                        var v = "",
                            k = o,
                            a = {};

                        // remove extension
                        if (/\.[a-z0-9]{2,4}$/.test(k)) {
                            v = k.replace(/\.[^.]+$/i, '');
                            k = '<img src="' + url + '/' + k + '" alt="' + ed.getLang('emotions.' + v, v) + '" />';
                        }

                        a[k] = v;
                        o = a;
                    }

                    each(o, function (v, k) {
                        DOM.add(content, 'div', {
                            "class": "mce_emotions_icon",
                            "title": ed.getLang('emotions.' + v, v)
                        }, k);
                    });
                });

                return content.innerHTML;
            }

            var path    = ed.getParam('emotions_url', url + '/img');
            var icons   = ed.getParam('emotions_smilies', emoji, 'hash');

            // test for json or txt file
            if (path && /\.(json|txt)$/.test(path)) {

                // resolve to local url if relative
                if (path.indexOf('://') === -1) {
                    path = ed.settings.base_url + path;
                }

                tinymce.util.XHR.send({
                    url: path,
                    success: function (text) {
                        try {
                            icons = JSON.parse(text);
                        } catch (e) {}

                        self.content = createEmojiContent(icons);
                    },
                    error: function() {
                        self.content = createEmojiContent(icons);
                    }
                });
            }
        },

        createControl: function (n, cm) {
            var self = this,
                ed = this.editor;
            switch (n) {
                case 'emotions':
                    var c = new tinymce.ui.ButtonDialog(cm.prefix + 'emotions', {
                        title: ed.getLang('emotions.desc', 'Insert an Emoticon'),
                        'class': 'mce_emotions',
                        'content': "",
                        'width': 250
                    }, ed);

                    c.onRenderDialog.add(function () {
                        DOM.setHTML(DOM.select('.mceButtonDialogContent', ed.id + '_emotions_dialog'), self.content);
                        
                        Event.add(DOM.select('.mceButtonDialogContent', ed.id + '_emotions_dialog'), 'click', function (e) {
                            e.preventDefault();
                            c.restoreSelection();

                            var n = e.target,
                                p = DOM.getParent(n, '.mce_emotions_icon');

                            if (p) {
                                var h = (n.nodeName === "IMG") ? p.innerHTML : p.innerText;
                                ed.execCommand('mceInsertContent', false, h);
                            }

                            c.hideDialog();
                        });
                    });

                    // Remove the menu element when the editor is removed
                    ed.onRemove.add(function () {
                        c.destroy();
                    });

                    return cm.add(c);
            }

            return null;
        }
    });
    tinymce.PluginManager.add("emotions", tinymce.plugins.EmotionsPlugin);
})();