<?php

/**
* @package   	JCE
* @copyright 	Copyright (c) 2009-2016 Ryan Demmer. All rights reserved.
* @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
* JCE is free software. This version may have been modified pursuant
* to the GNU General Public License, and as distributed it includes or
* is derivative of works licensed under the GNU General Public License or
* other free or open source software licenses.
*/
defined('_JEXEC') or die('RESTRICTED');

/**
* Installer function
* @return
*/
function com_install()
{
    $db = JFactory::getDBO();
    
    // Remove old module
    $query = 'SELECT id FROM #__modules WHERE module = ' . $db->quote('mod_jcefilebrowser');
    $db->setQuery($query);
    
    $id = $db->loadResult();
    
    if ($id) {
        $installer = new JInstaller();
        $installer->uninstall('module', $id);
    }
    
    $instance   = JInstaller::getInstance();

    if (!is_file($instance->getPath('extension_administrator') . '/install.php')) {
        return false;
    }

    require_once($instance->getPath('extension_administrator') . '/install.php');

    $manifest   = JPATH_PLUGINS . '/editors/jce.xml';
    $version    = 0;
    
    if (is_file($manifest)) {
        $data = JApplicationHelper::parseXMLInstallFile($manifest);
        $version = isset($data['version']) ? (string) $data['version'] : 0;
    }
    
    $instance->set('current_version', $version);
    
    $packages = array('plugin', 'module');

    // install packages
    $source = $instance->getPath('source');
    
    foreach ($packages as $folder) {
        $installer = new JInstaller();
        $installer->setOverwrite(true);
        
        // create path
        $path = $source . '/' . $folder;
        
        if ($installer->install($path)) {
            // enable module
            if ($folder === "modules") {
                $module = JTable::getInstance('module');
                
                $query = 'SELECT id FROM #__modules' . ' WHERE module = ' . $db->Quote($folder);
                $db->setQuery($query);
                $id = $db->loadResult();
                
                $module->load($id);
                $module->position = 'icon';
                $module->ordering = 100;
                $module->published = 1;
                $module->store();
            }
        }
    }
    
    return WFInstall::install($instance);
}

/**
* Uninstall function
* @return
*/
function com_uninstall()
{
    $app    = JFactory::getApplication();
    $db     = JFactory::getDBO();
    
    jimport('joomla.installer.installer');
    
    // Remove profiles if empty
    $query = $db->getQuery();
    $query = 'SELECT COUNT(id) FROM ' . $table;
    $db->setQuery($query);
    
    if ($db->loadResult() === 0) {
        $query = 'DROP TABLE IF EXISTS #__wf_profiles';
        $db->setQuery($query);
        $db->query();
    }
    
    // Remove editors plugin
    $query = 'SELECT id FROM #__plugins WHERE folder = ' . $db->quote('editors') . ' AND element = ' . $db->quote('jce');
    $db->setQuery($query);
    
    $id = $db->loadResult();
    
    if ($id) {
        $installer = new JInstaller();
        $installer->uninstall('plugin', $id);
        $app->enqueueMessage($installer->message);
    }
    
    // Remove module
    $query = 'SELECT id FROM #__modules WHERE module = ' . $db->quote('mod_jce_quickicon');
    $db->setQuery($query);
    
    $id = $db->loadResult();
    
    if ($id) {
        $installer = new JInstaller();
        $installer->uninstall('module', $id);
        $app->enqueueMessage($installer->message);
    }
    
    return true;
}
