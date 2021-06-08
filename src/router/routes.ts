import { PageRoute } from './page-route';

import Home from 'ui/pages/home';
import Guard from 'ui/pages/guard';
import Debug from 'ui/pages/debug';
import Login from 'ui/pages/login';
import Exchanges from 'ui/pages/exchanges';

const routes: PageRoute[] = [
  new PageRoute('/guard', Guard, true, true, 'GUARD'),
  new PageRoute('/', Home, true, false, 'HOME'),
  new PageRoute('/debug', Debug, true, true, 'DEBUG'),
  new PageRoute('/login', Login, true, false, 'Login'),
  new PageRoute('/exchanges', Exchanges, true, true, 'Login'),
];

export default routes;