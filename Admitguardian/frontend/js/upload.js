function makeactive(self) {
  document.getElementsByTagName("span")[0].innerHTML = `Upload Your ${self.innerHTML}`
}

const editor = document.getElementById('text-editor');
const alertsList = document.getElementById('alerts-list');

let timeout = null;

// Helper function to create a risk alert element
function createRiskAlert(type, message) {
  const li = document.createElement('li');
  li.className = `risk ${type}`;
  li.textContent = message;
  return li;
}

// Basic risk detection rules
function detectRisks(text) {
  const risks = [];

  if (text.length < 100) {
    risks.push({ type: 'critical', message: 'Essay is too short!' });
  }
  if (!text.toLowerCase().includes('research')) {
    risks.push({ type: 'warning', message: 'No mention of research experience.' });
  }
  if ((text.match(/i am|my passion|i have always loved/gi) || []).length > 2) {
    risks.push({ type: 'info', message: 'Too many cliché phrases detected.' });
  }
  if (text.split(' ').length < 150) {
    risks.push({ type: 'warning', message: 'Essay is missing detailed examples.' });
  }
  if (text.includes('!!!') || text.includes('???')) {
    risks.push({ type: 'critical', message: 'Too many informal punctuations.' });
  }

  return risks;
}

// Listen to typing events
editor.addEventListener('input', () => {
  clearTimeout(timeout);

  timeout = setTimeout(() => {
    const text = editor.value;
    const risks = detectRisks(text);

    alertsList.innerHTML = '';

    if (risks.length === 0) {
      const safe = createRiskAlert('info', 'No major risks detected. Looking good!');
      alertsList.appendChild(safe);
    } else {
      risks.forEach(risk => {
        const alert = createRiskAlert(risk.type, risk.message);
        alertsList.appendChild(alert);
      });
    }
  }, 1000); // wait 1 second after typing stops
});
