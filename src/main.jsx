import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from './redux/store';
import 'react-toastify/dist/ReactToastify.css';
import {ToastContainer} from "react-toastify"
ReactDOM.createRoot(document.getElementById("root")).render(
    <Provider store={store}>
    <BrowserRouter>
    <App />
    <ToastContainer/>
    </BrowserRouter>
    </Provider>
);
