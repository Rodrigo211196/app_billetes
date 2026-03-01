import React, { useEffect, useRef, useState } from 'react';

const API_URL = 'http://localhost:3001/api/check';

function App() {
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hola,Selecciona el corte del billete: 10, 20 o 50.' }
  ]);
  const [step, setStep] = useState('pick_denomination');
  const [denomination, setDenomination] = useState(null);
  const [serialInput, setSerialInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (type, text, tone = '') => {
    setMessages((prev) => [...prev, { type, text, tone }]);
  };

  const handleDenominationSelect = (value) => {
    setDenomination(value);
    addMessage('user', `Corte ${value}Bs`);
    addMessage('bot', `Ingresa el número de serie para ${value}Bs.`);
    setStep('enter_serial');
  };

  const handleSerialChange = (event) => {
    const next = event.target.value.replace(/\D/g, '').slice(0, 12);
    setSerialInput(next);
  };

  const handleCheckSerial = async () => {
    const serial = serialInput.trim();
    if (!serial || !denomination) return;

    addMessage('user', serial);
    setSerialInput('');

    try {
      const response = await fetch(`${API_URL}?denomination=${denomination}&serial=${serial}`);
      const data = await response.json();

      if (!response.ok) {
        addMessage('bot', data.error || 'No se pudo validar la serie.', 'invalid');
      } else if (data.valid) {
        addMessage('bot', data.message, 'valid');
      } else {
        addMessage('bot', data.message, 'invalid');
      }
    } catch {
      addMessage('bot', 'Error de conexión con el servidor.', 'invalid');
    }

    addMessage('bot', 'Si deseas otra consulta, vuelve a elegir un corte.');
    setStep('pick_denomination');
    setDenomination(null);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleCheckSerial();
    }
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>NÚMEROS DE SERIE - Chatbot</h1>
        <p>solo serie B</p>
      </header>

      <main className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type} ${msg.tone || ''}`.trim()}>
            {msg.text}
            {index === messages.length - 1 && msg.type === 'bot' && step === 'pick_denomination' && (
              <div className="options-container">
                {[10, 20, 50].map((value) => (
                  <button
                    key={value}
                    className="option-btn"
                    onClick={() => handleDenominationSelect(value)}
                  >
                    Bs{value}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      {step === 'enter_serial' && (
        <div className="input-area">
          <input
            type="text"
            placeholder="Escribe el número de serie (máx. 12)"
            value={serialInput}
            onChange={handleSerialChange}
            onKeyDown={handleKeyDown}
            maxLength={12}
            inputMode="numeric"
            autoFocus
          />
          <button className="send-btn" onClick={handleCheckSerial} aria-label="Validar serie">
            Validar
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
