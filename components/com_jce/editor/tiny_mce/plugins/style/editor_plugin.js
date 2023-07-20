/**
 * editor_plugin_src.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function () {
    tinymce.create('tinymce.plugins.StylePlugin', {
        init: function (ed, url) {
            
            function isRootNode(node) {
                return node == ed.dom.getRoot();
            }
            
            // Register commands
            ed.addCommand('mceStyleProps', function () {
                var applyStyleToBlocks = false;
                var blocks = ed.selection.getSelectedBlocks();
                var styles = [];

                if (blocks.length === 1) {
                    styles.push(ed.selection.getNode().style.cssText);
                } else {
                    tinymce.each(blocks, function (block) {
                        styles.push(ed.dom.getAttrib(block, 'style'));
                    });
                    applyStyleToBlocks = true;
                }

                ed.windowManager.open({
                    file: ed.getParam('site_url') + 'index.php?option=com_jce&task=plugin.display&plugin=style',
                    size: 'mce-modal-landscape-xxlarge'
                }, {
                    applyStyleToBlocks: applyStyleToBlocks,
                    plugin_url: url,
                    styles: styles
                });
            });

            ed.addCommand('mceSetElementStyle', function (ui, v) {
                var node = ed.selection.getNode();

                if (node) {
                    ed.dom.setAttrib(node, 'style', v);
                    ed.execCommand('mceRepaint');
                }
            });

            ed.onNodeChange.add(function (ed, cm, n) {
                cm.setDisabled('style', isRootNode(n) || n.hasAttribute('data-mce-bogus'));
            });

            // Register buttons
            ed.addButton('style', {
                title: 'style.desc',
                cmd: 'mceStyleProps'
            });
        }
    });

    // Register plugin
    tinymce.PluginManager.add('style', tinymce.plugins.StylePlugin);
})();
