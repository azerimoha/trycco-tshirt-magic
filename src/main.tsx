
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster as SonnerToaster } from './components/ui/SonnerToaster.tsx'

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <SonnerToaster />
  </>
);
