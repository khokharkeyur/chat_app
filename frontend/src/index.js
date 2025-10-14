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

let persistor = persistStore(store);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <WindowSizeProvider>
          <App />
        </WindowSizeProvider>
        <Toaster
          toastOptions={{
            position: "top-right",
            style: {
              zIndex: 1110,
            },
          }}
        />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
