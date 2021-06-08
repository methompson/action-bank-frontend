import { Switch, Route, Redirect } from 'react-router';
import { useSelector } from 'react-redux';

import routes from 'router/routes';
import { selectors } from 'store';

import FourOhFour from 'ui/pages/404';
import Home from './home';

import { PageRoute } from 'router/page-route';

export default function PageContent() {
  const loggedIn = useSelector(selectors.isLoggedIn);

  const r = new PageRoute('/', Home, true, false, 'HOME');

  return (
    <Switch>
      {
        routes.map((route) => {
          let component;
          if (!route.authGuard) {
            component = <route.Component />;
          } else {
            component = loggedIn ? <route.Component /> : <Redirect to='/' />;
          }
          return (
            <Route path={route.path} exact={route.exact} key={`route_${route.key}`}>
              {component}
            </Route>
          );
        })
      }
      <Route path='/' key='route_HOME'>
        {
          <r.Component />
        }
      </Route>
      <Route path='*' key='route_*'>
        <FourOhFour />
      </Route>
    </Switch>
  );
}
