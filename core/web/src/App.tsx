import {BrowserRouter} from 'react-router-dom';
import WebRouter from './router/WebRouter';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <WebRouter />
    </BrowserRouter>
  );
    
}

export default App;
