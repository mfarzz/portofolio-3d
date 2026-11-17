import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import './styles/index.css';
import './styles/choreography.css';
import './styles/boot-intro.css';
import './styles/linux-workspace.css';
import './styles/data-signal.css';
import './styles/github-activity.css';
import './styles/project-details.css';
import './styles/neural-workflow.css';
import './styles/arc-gallery.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>,
);
