import {BrowserRouter} from 'react-router-dom';
import WebRouter from './router/WebRouter';
import ScrollToTop from './components/ScrollToTop';
import DynamicTitle from './components/DynamicTitle';
import UserAuthProvider from './provider/UserAuthProvider';
import { PromptProvider } from "./contexts/PromptContext"

function App() {
  return (
      <BrowserRouter>
        <UserAuthProvider>
          <PromptProvider>
            <DynamicTitle />
            <ScrollToTop />
            <WebRouter />
          </PromptProvider>
        </UserAuthProvider>
      </BrowserRouter>
  );
}

export default App;
