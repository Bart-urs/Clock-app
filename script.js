const alarms = {};
const countdownDisplay = document.getElementById('notification');
const alarmList = document.querySelector('.alarmList');
const alarmSound = new Audio('alarm.mp3');
let countdownInterval;
let stopwatchIntervalId = null;
let stopWatchSeconds = 0;
let count = 0;
let intervalId = null;
let initialCountdown = 0;
let countdown = 0;
let remainingTime = 0;

const setAlarm = (time, isSnooze = false) => {
    const now = new Date();
    const [hours, minutes] = time.split(':');
    const alarmTime = new Date();
    alarmTime.setHours(hours);
    alarmTime.setMinutes(minutes);
    const timeDifference = alarmTime.getTime() - now.getTime();
    if (!time) {
        alert('Proszę podać czas alarmu.');
        return;
    }

    if (timeDifference < 0) {
        alert('Czas alarmu nie może być wcześniejszy niż obecny czas.');
        return;
    }

    let id = Date.now();

    let alarmContainer = document.createElement('div');
    alarmContainer.style.display = 'flex';
    alarmContainer.style.justifyContent = 'center';
    alarmContainer.style.alignItems = 'center';

    let alarmText = document.createElement('div');
    alarmText.textContent = isSnooze ? `Drzemka: ${time}` : `Alarm ustawiono na godzinę: ${time}`;
    alarmText.style.marginBottom = '15px';

    if (!isSnooze) {
        let deleteButton = document.createElement('button');
        deleteButton.textContent = 'Usuń';
        deleteButton.addEventListener('click', () => {
            delete alarms[id];
            alarmList.removeChild(alarmContainer);
        });
        alarmContainer.appendChild(alarmText);
        alarmContainer.appendChild(deleteButton);
        alarmList.appendChild(alarmContainer);
    } 

    alarms[id] = {
        time: alarmTime,
        element: alarmContainer,
        timeoutId: setTimeout(() => { // Dodajemy opóźnienie
            alarmSound.play();
            if (alarmList.contains(alarms[id].element)) {
                alarmList.removeChild(alarms[id].element);
            }
            delete alarms[id];
            alarmTime.value = '';
        }, timeDifference * 1000) // Przeliczamy sekundy na milisekundy
    };
}
const updateClock = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    document.getElementById('hour').innerHTML = `${hours < 10 ? "0" : ""}${hours}`;
    document.getElementById('minute').innerHTML = `${minutes < 10 ? "0" : ""}${minutes}`;
    document.getElementById('second').innerHTML = `${seconds < 10 ? "0" : ""}${seconds}`;

    // Dodajemy datę
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // getMonth() zwraca wartość od 0 do 11
    const day = now.getDate();
    document.getElementById('date').innerHTML = `${day < 10 ? "0" : ""}${day}.${month < 10 ? "0" : ""}${month}.${year}`;

    // Dodajemy dzień tygodnia
    const days = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
    const dayOfWeek = days[now.getDay()];
    document.getElementById('dayOfWeek').innerHTML = dayOfWeek;
}

const checkAlarms = () => {
    const now = new Date();
    now.setSeconds(0);
    const currentTime = `${now.getHours()}:${now.getMinutes()}`;

    Object.keys(alarms).forEach((id) => {
        const alarmTimeString = `${alarms[id].time.getHours()}:${alarms[id].time.getMinutes()}`;

        if (alarmTimeString === currentTime) {
            countdownDisplay.innerHTML = 'Alarm!';
            countdownDisplay.classList.add('pulse');
            document.getElementById('dismissButton').style.display = 'block';
            document.getElementById('snoozeButton').style.display = 'block';
            document.getElementById('snoozeOptions').style.display = 'block';
            if (alarmList.contains(alarms[id].element)) {
                alarmList.removeChild(alarms[id].element);
            }
            delete alarms[id];
            alarmSound.play();
            alarmTime.value = '';
        }
    });
}

document.getElementById('dismissTimerButton').addEventListener('click', () => {
    alarmSound.pause();
    alarmSound.currentTime = 0;
    document.getElementById('dismissTimerButton').style.display = 'none';
    countdownDisplay.innerHTML = '';
    clearInterval(countdownInterval);
});

document.getElementById('cancelSnoozeButton').addEventListener('click', () => {
    clearInterval(countdownInterval);
    countdownDisplay.innerHTML = '';
    document.getElementById('hiddenContainer').appendChild(cancelSnoozeButton);
    cancelSnoozeButton.style.display = 'none';
    alarmSound.pause();
    alarmSound.currentTime = 0;
    Object.keys(alarms).forEach((id) => {
        if (alarmList.contains(alarms[id].element)) {
            alarmList.removeChild(alarms[id].element);
        }
        delete alarms[id];
    });
    // Dodajemy poniższe linie, aby ukryć przyciski
    document.getElementById('dismissButton').style.display = 'none';
    document.getElementById('snoozeButton').style.display = 'none';
    document.getElementById('snoozeOptions').style.display = 'none';
});

let elapsed = 0;

function startStopwatch() {
    if (stopwatchIntervalId) {
        return; // Jeśli stoper już działa, nie rób nic
    }

    let startTime = Date.now() - elapsed;
    stopwatchIntervalId = setInterval(() => {
        let elapsedTime = Date.now() - startTime;
        elapsed = elapsedTime;
        let hours = Math.floor(elapsedTime / 3600000);
        let minutes = Math.floor((elapsedTime % 3600000) / 60000);
        let seconds = Math.floor((elapsedTime % 60000) / 1000);
        let milliseconds = elapsedTime % 1000;
        document.getElementById('stopwatch').textContent = `${hours < 10 ? "0" : ""}${hours}:${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}:${milliseconds < 100 ? milliseconds < 10 ? "00" : "0" : ""}${milliseconds}`;
    }, 1);
}

function stopStopwatch() {
    if (stopwatchIntervalId) {
        clearInterval(stopwatchIntervalId);
        stopwatchIntervalId = null;
    }
}

function resetStopwatch() {
    if (stopwatchIntervalId) {
        clearInterval(stopwatchIntervalId);
        stopwatchIntervalId = null;
    }
    elapsed = 0; // Resetuj zmienną przechowującą upływający czas
    document.getElementById('stopwatch').textContent = '00:00:00:000';
}

function startTimer(minutes) {
    if (intervalId) {
        return;
    }

    if (!remainingTime) {
        if (!minutes) {
            alert('Proszę wprowadzić wartość minut.');
            return;
        }
        initialCountdown = minutes * 60;
    } else { // Jeśli jest pozostały czas, użyj go
        initialCountdown = remainingTime;
        remainingTime = 0; // Zresetuj pozostały czas
    }

    countdown = initialCountdown;
    intervalId = setInterval(() => {
        countdown--;
        const seconds = countdown % 60;
        const minutes = Math.floor(countdown / 60);
        document.getElementById('timer').textContent = `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
        if (countdown <= 0) {
            clearInterval(intervalId);
            intervalId = null;
            alarmSound.play();
            document.getElementById('dismissTimerButton').style.display = 'block'; // Pokaż przycisk Wyłącz minutnik
        }
    }, 1000);
    document.getElementById('minutes').value = '';
}

function stopTimer() {
    if (intervalId) {
        remainingTime = countdown; // Zapisz pozostały czas
        clearInterval(intervalId);
        intervalId = null;
    }
}

function resetTimer() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
    initialCountdown = 0;
    countdown = 0;
    remainingTime = 0; // Dodaj tę linię
    document.getElementById('timer').textContent = '00:00';
    document.getElementById('minutes').value = '';
}

function showTimer() {
    const elements = ['timer', 'minutes', 'timerStopButton', 'timerResetButton', 'startButton'];
    elements.forEach(element => {
        const el = document.getElementById(element);
        if (el.classList.contains('hidden')) {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    });
}

function hideElement(id) {
    document.getElementById(id).classList.add('hidden');
}

function showElement(id) {
    document.getElementById(id).classList.remove('hidden');
}

function startSnoozeCountdown(minutes) {
    countdown = minutes * 60;
    countdownDisplay.innerHTML = 'Drzemka: ' + formatTime(countdown);
    countdownDisplay.classList.remove('pulse');
    document.getElementById('cancelSnoozeButton').style.display = 'block'; // Pokaż przycisk "Anuluj drzemkę"
    countdownInterval = setInterval(() => {
        countdown--;
        countdownDisplay.innerHTML = 'Drzemka: ' + formatTime(countdown);
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            countdownDisplay.innerHTML = 'Alarm!';
            countdownDisplay.classList.add('pulse');
            alarmSound.play();
            document.getElementById('dismissButton').style.display = 'block';
            document.getElementById('snoozeButton').style.display = 'block';
            document.getElementById('snoozeOptions').style.display = 'block';
            document.getElementById('cancelSnoozeButton').style.display = 'none'; // Ukryj przycisk "Anuluj drzemkę"
        }
    }, 1000);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? "0" : ""}${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
}

document.getElementById('toggleAlarmForm').addEventListener('click', function() {
    const alarmForm = document.getElementById('alarmForm');
    // alarmForm.classList.toggle('slide-down');
    if (alarmForm.classList.contains('hidden')) {
        alarmForm.classList.remove('hidden');
    } else {
        alarmForm.classList.add('hidden');
    }
});

document.getElementById('minutnik').addEventListener('click', showTimer);

document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('stoperText').addEventListener('click', () => {
        const elements = ['stopwatch', 'stopwatchStartButton', 'stopwatchStopButton', 'stopwatchResetButton'];
        // stopwatch.classList.toggle('slide-down');
        elements.forEach(element => {
            const el = document.getElementById(element);
            el.classList.toggle('hidden');
        });
    });
   
    const alarmForm = document.getElementById('alarmForm');
    const alarmTime = document.getElementById('alarmTime');

    alarmForm.addEventListener('submit', (e) => {
        e.preventDefault();
        setAlarm(alarmTime.value);
        alarmTime.value = ''; 
    });

    setInterval(updateClock, 1000);

    document.getElementById('dismissButton').addEventListener('click', () => {
        alarmSound.pause();
        alarmSound.currentTime = 0;
        document.getElementById('dismissButton').style.display = 'none';
        document.getElementById('snoozeButton').style.display = 'none';
        document.getElementById('snoozeOptions').style.display = 'none';
        countdownDisplay.innerHTML = '';
    });

    let snoozeButton = document.getElementById('snoozeButton');
    let snoozeOptions = document.getElementById('snoozeOptions');

    let cancelSnoozeButton = document.getElementById('cancelSnoozeButton');

    cancelSnoozeButton.addEventListener('click', () => {
        clearInterval(countdownInterval);
        countdownDisplay.innerHTML = '';
        // Ustaw przycisk "Anuluj drzemkę" obok 'countdownDisplay'
        document.getElementById('hiddenContainer').appendChild(cancelSnoozeButton); // zmienione na 'hiddenContainer'
        cancelSnoozeButton.style.display = 'none'; // ukryj przycisk "Anuluj drzemkę"
    });

    snoozeButton.addEventListener('click', () => {
        alarmSound.pause();
        alarmSound.currentTime = 0;
        let snoozeAlarm = new Date();
        let snoozeTime = parseInt(snoozeOptions.value);
        snoozeAlarm.setMinutes(snoozeAlarm.getMinutes() + snoozeTime);
        setAlarm(snoozeAlarm.getHours() + ':' + snoozeAlarm.getMinutes(), true);
        snoozeButton.style.display = 'none';
        snoozeOptions.style.display = 'none';
        document.getElementById('dismissButton').style.display = 'none';
        startSnoozeCountdown(snoozeTime); // Dodane odliczanie drzemki
        document.getElementById('snoozeContainer').appendChild(cancelSnoozeButton);
        cancelSnoozeButton.style.display = 'block';
    });

setInterval(checkAlarms, 1000);
 document.getElementById('timerStopButton').addEventListener('click', stopTimer);
 document.getElementById('timerResetButton').addEventListener('click', resetTimer);
});



