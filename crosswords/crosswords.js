const createCrosswordsPuzzle = (words, answer) => {
  const getLettersCoordinates = ({ startingPosition: { x, y }, direction, answer }) => {
    return answer.split('').map((letter, index) => {
      switch (direction) {
        case 'vertical': {
          return {
            letter,
            x: x + index,
            y,
          };
        }
        case 'horizontal': {
          return {
            letter,
            x,
            y: y + index,
          };
        }
        default: {
          throw new Error(`Invalid direction: ${direction}`);
        }
      }
    })
  };

  const createMatrix = (lettersCoordinates) => {
    const matrix = [];
    lettersCoordinates.forEach(({ letter, x, y }) => {
      for (let index = matrix.length; index <= x; index = index + 1) {
        matrix.push([]);
      }
      const row = matrix[x];
      for (let index = row.length; index <= y; index = index + 1) {
        row.push([]);
      }
      if (typeof matrix[x][y] === 'string' && matrix[x][y].toLowerCase() !== letter.toLowerCase()) {
        console.error('Mismatch at coordinate', x, y, matrix[x][y], letter);
      }
      matrix[x][y] = { letter };
    });
    return matrix;
  };

  const addIndexes = (matrix, words) => {
    words.forEach(({ startingPosition: { x, y }, index }) => {
      matrix[x][y].index = index;
    });
  };

  const getCell = (table, x, y) => table.querySelector(`tr:nth-child(${x + 1}) td:nth-child(${y + 1})`);

  const isCellEmpty = (td) => {
    const input = td.querySelector('input');
    if (!input) {
      return false;
    }
    return !input.value;
  } ;

  const moveCursorToNextCell = (table, { x, y }) => {
    const nextRight = getCell(table, x, y + 1);
    if (nextRight && isCellEmpty(nextRight)) {
      nextRight.querySelector('input').focus();
    } else {
      const nextBottom = getCell(table, x + 1, y);
      if (nextBottom) {
        nextBottom.querySelector('input').focus();
      }
    }
  };

  const lettersCoordinates = words.map(getLettersCoordinates).reduce(
    (accumulator, value) => [...accumulator, ...value],
    [],
  );
  const matrix = createMatrix(lettersCoordinates);
  addIndexes(matrix, words);
  const width = matrix.map(row => row.length).reduce((max, current) => Math.max(max, current), 0);

  const table = document.createElement('table');
  const tableCellsWithWords = [];

  for (let rowIndex = 0; rowIndex < matrix.length; rowIndex = rowIndex + 1) {
    const tr = document.createElement('tr');
    for (let columnIndex = 0; columnIndex < width; columnIndex = columnIndex + 1) {
      const { letter, index } = matrix[rowIndex][columnIndex] || {};
      const td = document.createElement('td');
      if (typeof letter === 'string') {
        if (index) {
          const span = document.createElement('span');
          span.innerText = index;
          td.append(span);
        }
        const input = document.createElement('input');
        input.maxLength = 1;
        input.onkeyup = () => {
          input.value = (input.value || '').trim();
          if (input.value) {
            const currentPosition = { x: rowIndex, y: columnIndex };
            moveCursorToNextCell(table, currentPosition);
          }
        };
        td.append(input);
        tableCellsWithWords.push({ td, input, letter });
      }
      tr.append(td);
    }
    table.append(tr);
  }

  answer.forEach(({ x, y, line }) => {
    const td = getCell(table, x, y);
    if (!td) {
      console.error('Invalid answer coordinates', x, y);
    }
    if (line) {
      td.classList.add(`answer-${line}`)
    } else {
      td.classList.add('answer');
    }
  });

  const check = () => {
    let valid = true;
    tableCellsWithWords.forEach(({ td, input, letter }) => {
      const expected = letter.toLowerCase();
      const actual = input.value.toLowerCase();
      if (expected !== actual) {
        td.classList.add('error');
        valid = false;
      } else {
        td.classList.remove('error');
      }
    });
    if (valid) {
      alert('La parola nascosta è Parità.');
    }
  };

  return { table, check };
};
