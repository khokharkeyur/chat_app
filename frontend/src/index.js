import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import store from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import { WindowSizeProvider } from "./config/WindowSizeContext";
import { SocketProvider } from "./config/SocketContext";

let persistor = persistStore(store);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <SocketProvider>
        <WindowSizeProvider>
          <App />
        </WindowSizeProvider>
      </SocketProvider>
      <Toaster
        toastOptions={{
          position: "top-right",
          style: {
            zIndex: 1110,
          },
        }}
      />
    </PersistGate>
  </Provider>,
);
