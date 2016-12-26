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

class pkg_jceInstallerScript {
	
	public function install($parent) {
		// enable plugins
		$plugin = JTable::getInstance('extension');
		
		foreach(array('content', 'extension', 'installer', 'quickicon', 'system') as $folder) {
            $id = $plugin->find(array('type' => 'plugin', 'folder' => $folder, 'element' => 'jce'));

            if ($id) {
                $plugin->load($id);
                $plugin->enabled = 1;
                $plugin->store();    
            }
        }

		require_once(JPATH_ADMINISTRATOR . '/components/com_jce/install.php');
		
		$installer = method_exists($parent, 'getParent') ? $parent->getParent() : $parent->parent;
		
		return WFInstall::install($installer);
	}
	
	public function uninstall() {
		$db = JFactory::getDBO();
		
		$query = $db->getQuery(true);
		$query->select('COUNT(id)')->from('#__wf_profiles');
		$db->setQuery($query);
		
		// profiles table is empty, remove...
		if ($db->loadResult() === 0) {
			$db->dropTable('#__wf_profiles', true);
			$db->query();
		}
	}
	
	public function update($installer) {
		return $this->install($installer);
	}
	
	public function preflight($type, $parent) {
		$installer = method_exists($parent, 'getParent') ? $parent->getParent() : $parent->parent;
		
		$manifest   = JPATH_PLUGINS . '/editors/jce/jce.xml';
		$version    = 0;
		
		if (is_file($manifest)) {
			$data = JApplicationHelper::parseXMLInstallFile($manifest);
			$version = isset($data['version']) ? (string) $data['version'] : 0;
		}
		
		$installer->set('current_version', $version);
	}
	
	public function postflight($type, $parent) {		
		$extension = JTable::getInstance('extension');
		
		// remove "jcefilebrowser" quickicon
		$id = $extension->find(array('type' => 'plugin', 'folder' => 'quickicon', 'element' => 'jcefilebrowser'));
		
		if ($id) {
			$installer = new JInstaller();
			$installer->uninstall('plugin', $id);
		}

		if (JPluginHelper::getPlugin('extension', 'joomla')) {
			$plugin = new PlgExtensionJoomla();

			// find and remove package
			$component_id = $extension->find(array('type' => 'component', 'element' => 'com_jce'));

			if ($component_id) {
				$plugin->onExtensionAfterUninstall($parent, $component_id, true);
			}

			// find and remove package
			$package_id = $extension->find(array('type' => 'package', 'element' => 'pkg_jce'));

			if ($package_id) {
				// remove
				$plugin->onExtensionAfterUninstall($parent, $package_id, true);
				// install
				$plugin->onExtensionAfterInstall($parent, $package_id);
			}
		}
	}
}