import {BrowserRouter} from 'react-router-dom';
import WebRouter from './router/WebRouter';
import ScrollToTop from './components/ScrollToTop';
import DynamicTitle from './components/DynamicTitle';
import UserAuthProvider from './provider/UserAuthProvider';
function App() {
  return (
      <BrowserRouter>
        <UserAuthProvider>
          <DynamicTitle />
          <ScrollToTop />
          <WebRouter />
        </UserAuthProvider>
      </BrowserRouter>
  );
}

export default App;
