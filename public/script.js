let count = 0;

function updateCount() {
  document.getElementById('count').innerText = count;
}

async function increment() {
  try {
    const response = await fetch('/count/increment', { method: 'POST' });
    const data = await response.json();
    if (!data.success) {
      console.error('Error incrementing count on the server.');
    }
  } catch (error) {
    console.error('Error incrementing count:', error);
  }
}

function handleWebSocketMessage(event) {
  const message = JSON.parse(event.data);
  if (message.type === 'count') {
    count = message.count;
    updateCount();
  }
}

document.getElementById('incrementButton').addEventListener('click', increment);

const socket = new WebSocket(`wss://${location.host}`);

socket.addEventListener('message', handleWebSocketMessage);

function fetchCount() {
  fetch('/count')
    .then((response) => response.json())
    .then((data) => {
      count = data.count;
      updateCount();
    })
    .catch((error) => {
      console.error('Error fetching count:', error);
    });
}

window.addEventListener('load', fetchCount);
