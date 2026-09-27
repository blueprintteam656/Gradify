import { BrowserRouter } from 'react-router-dom';
import Providers from './providers';
import AppRouter from './router';
import ErrorBoundary from '../components/feedback/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Providers>
          <AppRouter />
        </Providers>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
