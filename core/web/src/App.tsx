import {BrowserRouter} from 'react-router-dom';
import WebRouter from './router/WebRouter';
import ScrollToTop from './components/ScrollToTop';
import DynamicTitle from './components/DynamicTitle';

function App() {
  return (
    <BrowserRouter>
      <DynamicTitle />
      <ScrollToTop />
      <WebRouter />
    </BrowserRouter>
  );
    
}

export default App;
