<?php

// Check to ensure this file is included in Joomla!
defined('JPATH_PLATFORM') or die;

class JceViewProfiles extends JViewLegacy
{
    protected $items;
    protected $pagination;
    protected $state;

    /**
     * Display the view.
     */
    public function display($tpl = null)
    {
        $this->items = $this->get('Items');
		$this->pagination = $this->get('Pagination');
		$this->state = $this->get('State');
		$this->filterForm = $this->get('FilterForm');
		$this->activeFilters = $this->get('ActiveFilters');

        $this->params = JComponentHelper::getParams('com_jce');

        // Check for errors.
        if (count($errors = $this->get('Errors'))) {
            JError::raiseError(500, implode("\n", $errors));

            return false;
        }

        JHtml::_('jquery.framework');

        $document = JFactory::getDocument();
        $document->addScript('components/com_jce/media/js/profiles.min.js');
        $document->addStyleSheet('components/com_jce/media/css/profiles.min.css');

        $this->addToolbar();
        $this->sidebar = JHtmlSidebar::render();
        parent::display($tpl);
    }

    /**
     * Add the page title and toolbar.
     *
     * @since   1.6
     */
    protected function addToolbar()
    {
        $state = $this->get('State');
        $user = JFactory::getUser();

        JToolbarHelper::title('JCE - ' . JText::_('WF_PROFILES'), 'users');

        $bar = JToolBar::getInstance('toolbar');

        if ($user->authorise('core.create', 'com_jce')) {
            JToolbarHelper::addNew('profile.add');
            JToolbarHelper::custom('profiles.copy', 'copy', 'copy', 'Copy', true);
            // Instantiate a new JLayoutFile instance and render the layout
            $layout = new JLayoutFile('toolbar.uploadprofile');
            $bar->appendButton('Custom', $layout->render(array()), 'upload');

            JToolbarHelper::custom('profiles.export', 'download', 'download', 'Export', true);
        }

        if ($user->authorise('core.edit.state', 'com_jce')) {
            JToolbarHelper::publish('profiles.publish', 'JTOOLBAR_PUBLISH', true);
            JToolbarHelper::unpublish('profiles.unpublish', 'JTOOLBAR_UNPUBLISH', true);
        }

        if ($user->authorise('core.delete', 'com_jce')) {
            JToolbarHelper::deleteList('', 'profiles.delete', 'JTOOLBAR_DELETE');
        }

        JHtmlSidebar::setAction('index.php?option=com_jce&view=profiles');

        if ($user->authorise('core.admin', 'com_jce')) {
            JToolbarHelper::preferences('com_jce');
        }
    }

    /**
     * Returns an array of fields the table can be sorted by.
     *
     * @return array Array containing the field name to sort by as the key and display text as value
     *
     * @since   3.0
     */
    protected function getSortFields()
    {
        return array(
            'a.ordering' => JText::_('JGRID_HEADING_ORDERING'),
            'a.title' => JText::_('JGLOBAL_TITLE'),
            'a.published' => JText::_('JSTATUS'),
            'a.id' => JText::_('JGRID_HEADING_ID'),
        );
    }
}
