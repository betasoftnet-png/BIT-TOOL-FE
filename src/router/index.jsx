import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';
import Calculator from '../pages/Calculator';
import Calendar from '../pages/Calendar';
import Settings from '../pages/Settings';
import Contacts from '../pages/Contacts';
import Translator from '../pages/Translator';
import Lens from '../pages/Lens';
import Weather from '../pages/Weather';
import News from '../pages/News';
import Keyboard from '../pages/Keyboard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/calculator', element: <Calculator /> },
      { path: '/calendar', element: <Calendar /> },
      { path: '/contacts', element: <Contacts /> },
      { path: '/translator', element: <Translator /> },
      { path: '/lens', element: <Lens /> },
      { path: '/weather', element: <Weather /> },
      { path: '/news', element: <News /> },
      { path: '/keyboard', element: <Keyboard /> },
      { path: '/settings', element: <Settings /> },
    ],
  },
]);
