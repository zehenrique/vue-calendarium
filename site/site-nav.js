// Shows the package version in the website navigation bar.
import { version } from '../package.json';

for (const badge of document.querySelectorAll('.site-nav__version')) {
  badge.textContent = `v${version}`;
}
