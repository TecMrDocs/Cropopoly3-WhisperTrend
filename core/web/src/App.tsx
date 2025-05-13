import React from 'react';
import {BrowserRouter} from 'react-router-dom';
import WebRouter from './router/WebRouter';

function App() {
  return (
    <BrowserRouter>
      <WebRouter />
    </BrowserRouter>
  );
    
}

export default App;
