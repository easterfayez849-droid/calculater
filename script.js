const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');
const keypad = document.getElementById('keypad');

let current = '0';
let previous = null;
let operator = null;
let waitingForOperand = false;
let expression = '';
let justCalculated = false;

function updateDisplay() {
  resultEl.textContent = current;
  expressionEl.textContent = expression || (operator ? `${previous} ${operator}` : 'Ready when you are');
}

function clearAll() {
  current = '0';
  previous = null;
  operator = null;
  waitingForOperand = false;
  expression = '';
  justCalculated = false;
  updateDisplay();
}

function inputDigit(digit) {
  if (justCalculated && !operator) {
    current = digit === '.' ? '0.' : digit;
    justCalculated = false;
    expression = '';
    updateDisplay();
    return;
  }
  if (waitingForOperand) {
    current = digit === '.' ? '0.' : digit;
    waitingForOperand = false;
  } else if (digit === '.') {
    if (!current.includes('.')) current += '.';
  } else {
    current = current === '0' ? digit : current + digit;
  }
  updateDisplay();
}

function formatNumber(number) {
  if (!Number.isFinite(number)) return 'Error';
  const rounded = Number.parseFloat(number.toPrecision(12));
  return String(rounded);
}

function calculate(a, b, op) {
  switch (op) {
    case '+': return a + b;
    case '−': return a - b;
    case '×': return a * b;
    case '÷': return b === 0 ? NaN : a / b;
    default: return b;
  }
}

function chooseOperator(nextOperator) {
  const inputValue = Number(current);
  if (!Number.isFinite(inputValue)) return;
  if (operator && !waitingForOperand) {
    const result = calculate(previous, inputValue, operator);
    current = formatNumber(result);
    if (current === 'Error') {
      expression = 'Cannot divide by zero';
      previous = null;
      operator = null;
      waitingForOperand = true;
      updateDisplay();
      return;
    }
    previous = Number(current);
  } else {
    previous = inputValue;
  }
  operator = nextOperator;
  expression = `${formatNumber(previous)} ${operator}`;
  waitingForOperand = true;
  justCalculated = false;
  updateDisplay();
}

function performEquals() {
  if (!operator || previous === null || waitingForOperand) return;
  const first = previous;
  const second = Number(current);
  const op = operator;
  const result = calculate(first, second, op);
  expression = `${formatNumber(first)} ${op} ${formatNumber(second)} =`;
  current = formatNumber(result);
  previous = null;
  operator = null;
  waitingForOperand = true;
  justCalculated = true;
  updateDisplay();
  if (current === 'Error') expressionEl.textContent = 'Cannot divide by zero';
}

function deleteLast() {
  if (waitingForOperand || justCalculated) return;
  current = current.length > 1 ? current.slice(0, -1) : '0';
  if (current === '-') current = '0';
  updateDisplay();
}

function percent() {
  const value = Number(current) / 100;
  current = formatNumber(value);
  waitingForOperand = false;
  justCalculated = false;
  updateDisplay();
}

function toggleSign() {
  if (current === '0' || current === 'Error') return;
  current = current.startsWith('-') ? current.slice(1) : `-${current}`;
  updateDisplay();
}

function handleAction(action) {
  switch (action) {
    case 'clear': clearAll(); break;
    case 'delete': deleteLast(); break;
    case 'percent': percent(); break;
    case 'sign': toggleSign(); break;
    case 'equals': performEquals(); break;
  }
}

keypad.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.value !== undefined) {
    const value = button.dataset.value;
    if (['+', '−', '×', '÷'].includes(value)) chooseOperator(value);
    else inputDigit(value);
  } else if (button.dataset.action) {
    handleAction(button.dataset.action);
  }
});

document.addEventListener('keydown', event => {
  if (/^[0-9.]$/.test(event.key)) {
    event.preventDefault();
    inputDigit(event.key);
  } else if (event.key === '+') chooseOperator('+');
  else if (event.key === '-') chooseOperator('−');
  else if (event.key === '*') chooseOperator('×');
  else if (event.key === '/') { event.preventDefault(); chooseOperator('÷'); }
  else if (event.key === 'Enter' || event.key === '=') { event.preventDefault(); performEquals(); }
  else if (event.key === 'Backspace') { event.preventDefault(); deleteLast(); }
  else if (event.key === 'Escape') clearAll();
  else if (event.key === '%') percent();
});

updateDisplay();
