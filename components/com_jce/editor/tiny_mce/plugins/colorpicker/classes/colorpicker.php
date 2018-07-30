<?php

/**
 * @copyright     Copyright (c) 2009-2018 Ryan Demmer. All rights reserved
 * @license       GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses
 */
defined('WF_EDITOR') or die('RESTRICTED');

require_once WF_EDITOR_LIBRARIES.'/classes/plugin.php';

class WFColorpickerPlugin extends WFEditorPlugin
{
    public function __construct()
    {
        parent::__construct(array('colorpicker' => true));
    }

    public function display()
    {
        parent::display();

        $document = WFDocument::getInstance();

        $document->addScript(array('colorpicker'), 'plugins');
        $document->addStyleSheet(array('colorpicker'), 'plugins');
    }
}
