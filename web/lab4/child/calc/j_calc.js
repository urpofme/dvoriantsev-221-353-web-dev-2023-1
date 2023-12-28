// "use strict";

function priority(operation) {
    if (operation == '+' || operation == '-') {
        return 1;
    } else {
        return 2;
    }
}

function isNumeric(str) {
    return /^\d+(.\d+){0,1}$/.test(str);
}

function isDigit(str) {
    return /^\d{1}$/.test(str);
}

function isOperation(str) {
    return /^[\+\-\*\/]{1}$/.test(str);
}

function tokenize(str) {
    let tokens = [];
    let lastNumber = '';
    for (char of str) {
        if (isDigit(char) || char == '.') {
            lastNumber += char;
        } else {
            if (lastNumber.length > 0) {
                tokens.push(lastNumber);
                lastNumber = '';
            }
        } 
        if (isOperation(char) || char == '(' || char == ')') {
            tokens.push(char);
        } 
    }
    if (lastNumber.length > 0) {
        tokens.push(lastNumber);
    }
    return tokens;
}

function compile(str) {
    let out = [];
    let stack = [];
    for (token of tokenize(str)) {
        if (isNumeric(token)) {
            out.push(token);
        } else if (isOperation(token)) {
            while (stack.length > 0 && 
                   isOperation(stack[stack.length - 1]) && 
                   priority(stack[stack.length - 1]) >= priority(token)) {
                out.push(stack.pop());
            }
            stack.push(token);
        } else if (token == '(') {
            stack.push(token);
        } else if (token == ')') {
            while (stack.length > 0 && stack[stack.length - 1] != '(') {
                out.push(stack.pop());
            }
            stack.pop();
        }
    }
    while (stack.length > 0) {
        out.push(stack.pop());
    }
    return out.join(' ');
}

function evaluate(rpn) {
    const stack = [];
    const tokens = rpn.split(' ');
  
    tokens.forEach(token => {
      if (isNumeric(token)) {
        stack.push(parseFloat(token));
      } else if (isOperation(token)) {
        const operand2 = stack.pop();
        const operand1 = stack.pop();
        switch (token) {
          case '+':
            stack.push(operand1 + operand2);
            break;
          case '-':
            stack.push(operand1 - operand2);
            break;
          case '*':
            stack.push(operand1 * operand2);
            break;
          case '/':
            stack.push(operand1 / operand2);
            break;
        }
      }
    });
  
    return stack.pop();
  }
  
  function clickHandler(event) {
    const buttonText = event.target.innerText;
    const screen = document.querySelector('.screen span');
    const currentExpression = screen.innerText;
  
    if (buttonText === '=') {
      const rpnExpression = compile(currentExpression);
      const result = evaluate(rpnExpression);
      screen.innerText = result;
    } else if (buttonText === 'C') {
      screen.innerText = '';
    } else {
      screen.innerText += buttonText;
    }
  }

  window.onload = function() {
    const buttons = document.querySelectorAll('.key');
    buttons.forEach(button => {
      button.addEventListener('click', clickHandler);
    });
  };