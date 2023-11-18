/* eslint-disable import/no-nodejs-modules */
/* eslint-disable import/no-unassigned-import */
import './index.css';
// import type Buffer from 'node:buffer';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ToastContainer } from 'react-toastify';

import { App } from '@/components';
import 'react-toastify/dist/ReactToastify.css';

// TODO: Find a better way to handle this buffer error
/* eslint-disable */

import { Buffer } from 'buffer'
globalThis.Buffer = Buffer

declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
  interface Window {
    Buffer: typeof Buffer;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.Fragment>
    <App />

    <ToastContainer
      className="toast-position"
      position="bottom-right"
      toastClassName={() =>
        "relative flex  bg-[#1C2023] w-[420px] rounded-[8px]  px-[16px] relative"
      }
      limit={1}
      pauseOnHover={false}
      hideProgressBar={true}
      pauseOnFocusLoss={false}
    />
  </React.Fragment>
);
