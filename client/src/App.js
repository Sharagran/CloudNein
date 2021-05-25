import Login from './pages/Login';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Registration from './pages/Registration';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import Settings from './pages/Settings';
import Record from './pages/Record';
import Photo from './pages/Photo';
import Failed from './pages/Failed';
import Success from './pages/Success';
import SendEmail from './pages/SendEmail';
import Storage from './pages/Storage';

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/"component={Login} />
        <Route path="/Registration" component={Registration} />
        <Route path="/ForgotPassword" component={ForgotPassword} />
        <Route path="/Home" component={Home} />
        <Route path="/Settings" component={Settings} />
        <Route path="/Record" component={Record} />
        <Route path="/Photo" component={Photo} />
        <Route path="/Failed" component={Failed} />
        <Route path="/Success" component={Success} />
        <Route path="/SendEmail" component={SendEmail} />
        <Route path="/Storage" component={Storage} />
      </Switch>
    </BrowserRouter>

  );
}

export default App;
