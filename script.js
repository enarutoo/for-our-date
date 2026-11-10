
let dateTime = null;
let countdownInterval = null;

const STORAGE_KEY = "ourDate";

function getElement(id) {
    return document.getElementById(id);
}

function saveDate() {
    const title = getElement("dateTitle").value.trim();
    const date = getElement("date").value;
    const time = getElement("time").value;
    const location = getElement("location").value.trim();
    const message = getElement("message").value.trim();

    if (!title || !date || !time || !location) {
        alert("Please complete the title, date, time, and location.");
        return;
    }

    const selectedDate = new Date(`${date}T${time}:00`);

    if (Number.isNaN(selectedDate.getTime())) {
        alert("Please enter a valid date and time.");
        return;
    }

    if (selectedDate <= new Date()) {
        alert("Please choose a future date and time.");
        return;
    }

    const dateData = {
        title,
        date,
        time,
        location,
        message
    };

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dateData));
    } catch (error) {
        alert("Unable to save your date. Please check your browser storage.");
        return;
    }

    displayDate(dateData);
    dateTime = selectedDate;
    updateCountdown();

    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    countdownInterval = setInterval(updateCountdown, 1000);
}

function displayDate(data) {
    getElement("displayTitle").textContent = `${data.title} 💕`;
    getElement("displayDate").textContent = formatDate(data.date);
    getElement("displayTime").textContent = formatTime(data.time);
    getElement("displayLocation").textContent = data.location;

    getElement("displayMessage").textContent =
        data.message || "Looking forward to this special day! ❤️";

    getElement("dateCard").style.display = "block";
}

function formatDate(date) {
    const selectedDate = new Date(`${date}T00:00:00`);

    return selectedDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

function formatTime(time) {
    const [hours, minutes] = time.split(":");
    const selectedTime = new Date();

    selectedTime.setHours(Number(hours), Number(minutes), 0, 0);

    return selectedTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
    });
}

function updateCountdown() {
    if (!dateTime) return;

    const countdown = getElement("countdown");

    if (!countdown) return;

    const now = new Date();
    const difference = dateTime.getTime() - now.getTime();

    if (difference <= 0) {
        countdown.textContent = "💕 It's date time! Enjoy your special day! 💕";
        clearInterval(countdownInterval);
        countdownInterval = null;
        return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / (1000 * 60)) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    countdown.textContent =
        `💕 ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds remaining`;
}

function loadSavedDate() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return;

    try {
        const data = JSON.parse(saved);

        if (
            !data ||
            typeof data.title !== "string" ||
            typeof data.date !== "string" ||
            typeof data.time !== "string" ||
            typeof data.location !== "string"
        ) {
            throw new Error("Invalid saved date.");
        }

        getElement("dateTitle").value = data.title;
        getElement("date").value = data.date;
        getElement("time").value = data.time;
        getElement("location").value = data.location;
        getElement("message").value = data.message || "";

        displayDate(data);

        const selectedDate = new Date(`${data.date}T${data.time}:00`);

        if (!Number.isNaN(selectedDate.getTime())) {
            dateTime = selectedDate;

            if (dateTime > new Date()) {
                updateCountdown();
                countdownInterval = setInterval(updateCountdown, 1000);
            } else {
                getElement("countdown").textContent =
                    "💕 Your scheduled date has arrived or passed.";
            }
        }
    } catch (error) {
        localStorage.removeItem(STORAGE_KEY);
        console.error("Unable to load saved date:", error);
    }
}

function clearDate() {
    const confirmed = confirm("Are you sure you want to delete the saved date?");

    if (!confirmed) return;

    localStorage.removeItem(STORAGE_KEY);

    dateTime = null;

    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }

    getElement("dateTitle").value = "";
    getElement("date").value = "";
    getElement("time").value = "";
    getElement("location").value = "";
    getElement("message").value = "";

    getElement("dateCard").style.display = "none";
    getElement("countdown").textContent = "No date scheduled yet.";
}

document.addEventListener("DOMContentLoaded", function () {
    loadSavedDate();

    const dateInput = getElement("date");

    if (dateInput) {
        dateInput.min = new Date().toLocaleDateString("en-CA");
    }
});
