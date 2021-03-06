import registerModule from '~/core/module';
import { loadModule } from '~/core/module-loader';

import { createElement, waitForLoad } from '~/utils/dom';
import {
  getHeader,
  getMobileSettingsLink,
  appendDesktopUserMenuElem,
  getDividers,
} from '~/shared/user-menu';

import optionsDialog from '~/modules/options-dialog'; // eslint-disable-line import/no-cycle
import about from '~/modules/about';

function appendDivider() {
  const dividers = getDividers();
  dividers[dividers.length - 1].remove();
  appendDesktopUserMenuElem(<li className="divider" />);
}

async function userMenuLinksMain() {
  await waitForLoad(() => getHeader() && getMobileSettingsLink());

  appendDivider();
  await loadModule(optionsDialog, true);
  await loadModule(about, true);
}

export default registerModule('{be1f2b48-87d7-4067-adc4-f68fb9f95d3b}', {
  name: 'internal.userMenuLinks',
  init: userMenuLinksMain,
  showInOptions: false,
});
