<?php
/**
 * @package     JCE
 * @subpackage  Installer.Jce
 * 
 * @copyright   Copyright (C) 2005 - 2023 Open Source Matters, Inc. All rights reserved
 * @copyright   Copyright (C) 2023 - 2024 Ryan Demmer. All rights reserved
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

namespace Joomla\Plugin\Installer\Jce\PluginTraits;

defined('_JEXEC') or die;

use Joomla\CMS\Component\ComponentHelper;
use Joomla\CMS\Factory;
use Joomla\CMS\Http\HttpFactory;
use Joomla\CMS\Language\Text;
use Joomla\CMS\Plugin\CMSPlugin;
use Joomla\CMS\Uri\Uri;

/**
 * Fields MediaJce FormTrait
 *
 * @since  2.9.73
 */
trait EventsTrait
{
    /**
     * Handle adding credentials to package download request.
     *
     * @param string $url     url from which package is going to be downloaded
     * @param array  $headers headers to be sent along the download request (key => value format)
     *
     * @return bool true if credentials have been added to request or not our business, false otherwise (credentials not set by user)
     *
     * @since   3.0
     */
    public function onInstallerBeforePackageDownload(&$url, &$headers)
    {
        $app = Factory::getApplication();

        $uri = Uri::getInstance($url);
        $host = $uri->getHost();

        if ($host !== 'www.joomlacontenteditor.net') {
            return true;
        }

        $component = ComponentHelper::getComponent('com_jce');

        // load plugin language for warning messages
        Factory::getLanguage()->load('plg_installer_jce', JPATH_ADMINISTRATOR);

        $key = $this->getDownloadKey();

        // if no key is set...
        if (empty($key)) {
            // if we are attempting to update JCE Pro, display a notice message
            if (strpos($url, 'pkg_jce_pro') !== false) {
                $app->enqueueMessage(Text::_('PLG_INSTALLER_JCE_KEY_WARNING'), 'notice');
            }

            return true;
        }

        // Append the subscription key to the download URL
        $uri->setVar('key', $key);

        // create the url string
        $url = $uri->toString();

        // check validity of the key and display a message if it is invalid / expired
        try {
            $tmpUri = clone $uri;
            $tmpUri->setVar('task', 'update.validate');

            $tmpUrl = $tmpUri->toString();
            $response = HttpFactory::getHttp()->get($tmpUrl, array());
        } catch (RuntimeException $exception) {
        }

        // invalid key, display a notice message
        if (403 == $response->code || 401 == $response->code) {
            $message = isset($response->body) ? $response->body : Text::_('PLG_INSTALLER_JCE_KEY_INVALID');
            $app->enqueueMessage($message, 'notice');
        }

        // update limit exceeded
        if (429 == $response->code || 499 === $response->code) {
            $message = isset($response->body) ? $response->body : Text::_('PLG_INSTALLER_JCE_UPDATE_LIMIT_REACHED');
            $app->enqueueMessage($message, 'notice');
        }

        return true;
    }
}