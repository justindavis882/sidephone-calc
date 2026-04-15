document.addEventListener("DOMContentLoaded", () => {
  // Splash Screen Logic
  const splash = document.getElementById('splash-screen');
  
  if (!localStorage.getItem('hasSeenSplash')) {
    splash.classList.remove('hidden');
    setTimeout(() => {
      splash.classList.add('hidden');
      localStorage.setItem('hasSeenSplash', 'true');
    }, 1500); // 1.5 seconds
  }

  // Calculator State Machine
  const display = document.getElementById('display');
  const historyDisplay = document.getElementById('history');
  let currentInput = '0';
  let previousInput = '';
  let operation = undefined;
  let isDegrees = true; // New state for angle mode
  const angleModeBtn = document.getElementById('angle-mode');

  // Toggle Angle Mode
  angleModeBtn.addEventListener('click', () => {
    isDegrees = !isDegrees;
    angleModeBtn.innerText = isDegrees ? 'DEG' : 'RAD';
  });
  
  const updateDisplay = () => {
    display.innerText = currentInput;
    if (operation != null) {
      historyDisplay.innerText = `${previousInput} ${operation}`;
    } else {
      historyDisplay.innerText = '';
    }
  };

  const appendNumber = (number) => {
    if (number === '.' && currentInput.includes('.')) return;
    if (currentInput === '0' && number !== '.') {
      currentInput = number;
    } else {
      currentInput += number;
    }
  };

  const chooseOperation = (op) => {
    if (currentInput === '') return;
    if (previousInput !== '') {
      compute();
    }
    operation = op;
    previousInput = currentInput;
    currentInput = '';
  };

  const compute = () => {
    let computation;
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);
    if (isNaN(prev) || isNaN(current)) return;
    
    // Quick switch for basic math
    switch (operation) {
      case '+': computation = prev + current; break;
      case '−': computation = prev - current; break; // Note: using the minus symbol from HTML
      case '×': computation = prev * current; break;
      case '÷': computation = prev / current; break;
      default: return;
    }
    currentInput = computation.toString();
    operation = undefined;
    previousInput = '';
  };

  const handleScientific = (action) => {
    // If user presses Pi, we inject it directly
    if (action === 'pi') {
      currentInput = Math.PI.toFixed(6).replace(/\.?0+$/, '');
      updateDisplay();
      return;
    }

    const current = parseFloat(currentInput);
    if (isNaN(current)) return;

    // Convert to radians if needed for trig functions
    let angle = isDegrees ? current * (Math.PI / 180) : current;

    switch (action) {
      // Trigonometry
      case 'sin': currentInput = Math.sin(angle).toFixed(6).replace(/\.?0+$/, ''); break;
      case 'cos': currentInput = Math.cos(angle).toFixed(6).replace(/\.?0+$/, ''); break;
      case 'tan': 
        // Handle undefined tangent at 90 / 270 degrees
        if (isDegrees && (current % 180 === 90 || current % 180 === -90)) {
            currentInput = 'Error';
        } else {
            currentInput = Math.tan(angle).toFixed(6).replace(/\.?0+$/, ''); 
        }
        break;
      
      // Advanced Math
      case 'pow': currentInput = Math.pow(current, 2).toString(); break;
      case 'sqrt': 
        if (current < 0) currentInput = 'Error'; // No imaginary numbers for now
        else currentInput = Math.sqrt(current).toFixed(6).replace(/\.?0+$/, ''); 
        break;
      case 'log': 
        if (current <= 0) currentInput = 'Error';
        else currentInput = Math.log10(current).toFixed(6).replace(/\.?0+$/, ''); 
        break;
      case 'ln': 
        if (current <= 0) currentInput = 'Error';
        else currentInput = Math.log(current).toFixed(6).replace(/\.?0+$/, ''); 
        break;
    }
    updateDisplay();
  };

  // Event Delegation for Keypad
  document.querySelector('.keypad').addEventListener('click', (e) => {
    if (!e.target.matches('button')) return;
    
    const btn = e.target;
    const action = btn.dataset.action;
    const value = btn.dataset.value;

    if (value !== undefined) {
      appendNumber(value);
      updateDisplay();
      return;
    }

    if (action === 'clear') {
      currentInput = '0';
      previousInput = '';
      operation = undefined;
      updateDisplay();
    } else if (action === 'delete') {
      currentInput = currentInput.toString().slice(0, -1) || '0';
      updateDisplay();
    } else if (action === 'calculate') {
      compute();
      updateDisplay();
    } else if (['sin', 'cos', 'tan', 'pow', 'sqrt', 'pi', 'log', 'ln'].includes(action)) {
      handleScientific(action);
    } else {
      // Map button actions to math symbols
      const opMap = { 'add': '+', 'subtract': '−', 'multiply': '×', 'divide': '÷' };
      chooseOperation(opMap[action]);
      updateDisplay();
    }
  });
});
