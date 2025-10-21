
// Home.js
import React, { useEffect, useState } from 'react';
import './App.css';

const Donate = () => {
  const btc = '13UAcHyf3xaqi4Xj3qE777CGGdFEbtMBxT';

  return (
    <>
      <header className="header">
        <h1>Незаметник</h1>
      </header>

      <main className="container donate">
        <h2>Перевод ЮМани</h2>
        <iframe
          src="https://yoomoney.ru/quickpay/fundraise/button?billNumber=1DGDN78M7RC.251019&"
          width="330" height="50"
          frameborder="0"
          allowtransparency="true"
          scrolling="no"></iframe>
      </main>
    </>
  );
};

export default Donate;
