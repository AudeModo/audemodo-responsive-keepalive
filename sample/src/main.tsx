import { createRoot } from 'react-dom/client';
import { installMatchMedia } from './lib/matchMedia';
import { App } from './App';
import './theme.css';

// Install the controllable matchMedia shim before the first render so the real
// library hooks read it. No StrictMode: its dev-only double-mount would muddy the
// instance-id demonstrations in the playground.
installMatchMedia();

const root = document.getElementById('root');
if (!root) throw new Error('Root element #root not found');
createRoot(root).render(<App />);
