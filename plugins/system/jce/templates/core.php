<?php

/**
 * @copyright   Copyright (C) 2021 Ryan Demmer. All rights reserved
 * @license     GNU General Public License version 2 or later
 */
defined('JPATH_BASE') or die;

class WfTemplateCore extends JPlugin
{
    private function findFile($template, $name) 
    {
        // template.css
        $file = JPath::find(array(
            JPATH_SITE . '/templates/' . $template . '/css',
            JPATH_SITE . '/media/templates/site/' . $template . '/css'
        ), $name);

        if ($file) {
            // make relative
            $file = str_replace(JPATH_SITE, '', $file);
            
            // remove leading slash
            $file = trim($file, '/');

            return $file;
        }

        return false;
    }
    
    public function onWfGetTemplateStylesheets(&$files, $template)
    {                        
        // already processed by a framework
        if (!empty($files)) {
            return false;
        }

        if ($template->parent) {
            // template.css
            $file = $this->findFile($template->parent, 'template.css');

            if ($file) {
                $files[] = $file;
            }

            // user.css
            $file = $this->findFile($template->parent, 'user.css');

            if ($file) {
                $files[] = $file;
            }
        }

        // template.css
        $file = $this->findFile($template->name, 'template.css');

        if ($file) {
            $files[] = $file;
        }

        // user.css
        $file = $this->findFile($template->name, 'user.css');

        if ($file) {
            $files[] = $file;
        }
    }
}