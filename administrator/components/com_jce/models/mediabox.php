<?php

/**
 * @copyright 	Copyright (c) 2009-2013 Ryan Demmer. All rights reserved
 * @license   	GNU/GPL 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 * JCE is free software. This version may have been modified pursuant
 * to the GNU General Public License, and as distributed it includes or
 * is derivative of works licensed under the GNU General Public License or
 * other free or open source software licenses
 */
defined('JPATH_PLATFORM') or die;

// load base model
jimport('joomla.application.component.modelform');

use Joomla\Utilities\ArrayHelper;

class JceModelMediabox extends JModelForm
{
    /**
     * Method to get a form object.
     *
     * @param array $data     Data for the form
     * @param bool  $loadData True if the form is to load its own data (default case), false if not
     *
     * @return mixed A JForm object on success, false on failure
     *
     * @since	1.6
     */
    public function getForm($data = array(), $loadData = true)
    {
        JForm::addFormPath(JPATH_PLUGINS . '/system/jcemediabox');

        JFactory::getLanguage()->load('plg_system_jcemediabox', JPATH_ADMINISTRATOR);

        // Get the form.
        $form = $this->loadForm('com_jce.mediabox', 'jcemediabox', array('control' => 'config', 'load_data' => $loadData), true, '//config');

        if (empty($form)) {
            return false;
        }

        return $form;
    }

    /**
     * Method to get the data that should be injected in the form.
     *
     * @return mixed The data for the form
     *
     * @since	1.6
     */
    protected function loadFormData()
    {
        // Check the session for previously entered form data.
        $data = JFactory::getApplication()->getUserState('com_jce.mediabox.plugin.data', array());

        if (empty($data)) {
            $data = $this->getData();
        }

        return $data;
    }

    /**
     * Method to get the configuration data.
     *
     * This method will load the global configuration data straight from
     * JConfig. If configuration data has been saved in the session, that
     * data will be merged into the original data, overwriting it.
     *
     * @return array An array containg all global config data
     *
     * @since	1.6
     */
    public function getData()
    {
        // Get the editor data
        $plugin = JPluginHelper::getPlugin('system', 'jcemediabox');
        $data = ArrayHelper::fromObject($plugin->params);

        return $data;
    }

    /**
     * Method to save the form data.
     *
     * @param   array  The form data
     *
     * @return bool True on success
     *
     * @since    3.0
     */
    public function save($data)
    {
        $table = JTable::getInstance('extension');

        $plugin = JPluginHelper::getPlugin('systtem', 'jcemediabox');

        if (!$plugin->id) {
            $this->setError('Invalid plugin');
            return false;
        }

        // Load the previous Data
        if (!$table->load($plugin->id)) {
            $this->setError($table->getError());
            return false;
        }

		// Bind the data.
        if (!$table->bind($data)) {
            $this->setError($table->getError());
            return false;
        }

		// Check the data.
        if (!$table->check()) {
            $this->setError($table->getError());
            return false;
        }
        
        // Store the data.
        if (!$table->store()) {
            $this->setError($table->getError());
            return false;
        }

        return true;
    }
}
