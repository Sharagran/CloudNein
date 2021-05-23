import Login from './pages/Login';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Registration from './pages/Registration';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/"component={Login} />
        <Route path="/Registration" component={Registration} />
        <Route path="/ForgotPassword" component={ForgotPassword} />
        <Route path="/Home" component={Home} />
        <Route path="/Settings" component={Settings} />
      </Switch>
    </BrowserRouter>

  );
}

export default App;
