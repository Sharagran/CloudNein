import React from "react";
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Login from './pages/Login';
import Registration from './pages/Registration';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import Settings from './pages/Settings';
import Record from './pages/Record';
import Photo from './pages/Photo';
import Failed from './pages/Failed';
import Success from './pages/Success';
import SendEmail from './pages/SendEmail';
import Upload from './pages/Upload';
import Admin from './pages/Admin';
import ShareFile from './pages/ShareFile';
import Fileexplorer from "./pages/Fileexplorer";
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons'
import { ToastProvider } from 'react-toast-notifications';

library.add(fas, fab);

function App() {
  return (
    <ToastProvider placement="bottom-right" autoDismiss="true">
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
        <Route path="/Upload" component={Upload} />
        <Route path="/Admin" component={Admin} />
        <Route path="/Storage" component={Fileexplorer} />
        <Route path="/ShareFile" component={ShareFile} />
      </Switch>
    </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
