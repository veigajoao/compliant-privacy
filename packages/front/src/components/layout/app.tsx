import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import routes from 'virtual:generated-pages-react';

const Pages = () => {
  return useRoutes(routes);
};

export const App = () => {
  return (
    <Router>
      <Pages />
    </Router>
  );
};
