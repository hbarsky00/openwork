import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import '@shopify/polaris/build/esm/styles.css';
import './styles/product.css';
import { App } from './App';
import { PolarisLink } from './components/PolarisLink';
import { StoreProvider } from './state/store';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider i18n={enTranslations} linkComponent={PolarisLink}>
        <StoreProvider>
          <App />
        </StoreProvider>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
