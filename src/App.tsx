/**
 * Copyright 2022 Beijing Volcano Engine Technology Co., Ltd. All Rights Reserved.
 * SPDX-license-identifier: BSD-3-Clause
 */
import { Helmet } from 'react-helmet';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import View from './pages/View';

function App() {
  return (
    <BrowserRouter>
      <Helmet>
        <link rel="icon" href="/favicon.png" />
      </Helmet>
      <Routes>
        <Route path="/">
          <Route index element={<View />} />
          <Route path="login" element={<Login />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
