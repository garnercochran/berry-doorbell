document.addEventListener('DOMContentLoaded', function () {
  const calendar = document.getElementById('calendar');
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = generateTimeSlots('08:30', '16:30');

  const unavailableTimes = {
    Monday: ['12:00', '12:30', '15:00', '15:30', '16:00'],
    Tuesday: ['09:30', '10:00', '10:30', '14:00', '14:30', '15:00'],
    Wednesday: ['15:00', '15:30', '16:00'],
    Thursday: ['09:30', '10:00', '10:30', '14:00', '14:30', '15:00', '15:30', '16:00'],
    Friday: ['11:00', '11:30', '15:00', '15:30', '16:00']
  };

  const officeHours = {
    Monday: ['13:00', '13:30', '14:00'],
    Wednesday: ['13:00', '13:30', '14:00'],
    Thursday: ['13:00', '13:30'],
    Friday: ['13:00', '13:30', '14:00', '14:30']
  };

  let header = '<tr><th>Time</th>';
  days.forEach(day => header += `<th>${day}</th>`);
  header += '</tr>';
  calendar.innerHTML = header;

  timeSlots.forEach(time => {
    let row = `<tr><td>${formatTime(time)}</td>`;
    days.forEach(day => {
      const isUnavailable = unavailableTimes[day]?.includes(time);
      const isOfficeHour = officeHours[day]?.includes(time);

      if (isUnavailable) {
        row += `<td class="unavailable"></td>`;
      } else if (isOfficeHour) {
        row += `<td class="office-hours" onclick="handleOfficeHourClick()"></td>`;
      } else {
        // Color all other slots green and make them selectable
        row += `<td class="maybe-available" onclick="toggleSelection(this)"></td>`;
      }
    });
    row += '</tr>';
    calendar.innerHTML += row;
  });
});

function generateTimeSlots(start, end) {
  const slots = [];
  let [hour, minute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);

  while (hour < endHour || (hour === endHour && minute <= endMinute)) {
    slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    minute += 30;
    if (minute === 60) {
      minute = 0;
      hour++;
    }
  }
  return slots;
}

function formatTime(time) {
  const [hour, minute] = time.split(':').map(Number);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

function toggleSelection(cell) {
  cell.classList.toggle('selected');
}

function handleOfficeHourClick() {
  // Create modal if it doesn't exist
  if (!document.getElementById('officeHourModal')) {
    const modal = document.createElement('div');
    modal.id = 'officeHourModal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '1000';

    modal.innerHTML = `
      <div style="background:#fff;padding:30px 40px;border-radius:10px;max-width:400px;text-align:center;position:relative;">
        <p>
          For any time colored blue, these are open office hours. You can drop by my office to see if I am available during these times,<br><br>
          or <a href="https://outlook.office.com/book/DrGarnerCochran@berry.edu/" target="_blank" style="color:#005A9C;text-decoration:underline;">click this link to immediately book a meeting during this time</a>.
        </p>
        <button id="closeOfficeHourModal" style="margin-top:20px;padding:8px 20px;border:none;background:#00205B;color:#fff;border-radius:5px;cursor:pointer;">Close</button>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('closeOfficeHourModal').onclick = function() {
      modal.remove();
    };
  }
}

function getTimeInterval(startTime) {
  const [hourStr, minuteStr] = startTime.split(':');
  let hour = parseInt(hourStr);
  let minute = parseInt(minuteStr);

  let endHour = hour;
  let endMinute = minute + 30;
  if (endMinute >= 60) {
    endMinute -= 60;
    endHour += 1;
  }

  const format = (h, m) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    return `${displayHour}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  return {
    start: format(hour, minute),
    end: format(endHour, endMinute)
  };
}

function sendAvailability() {
  const selectedCells = document.querySelectorAll('.selected');
  if (selectedCells.length < 5) {
    alert('Please select at least 5 time slots where you might be available.');
    return;
  }

  const headerRow = document.querySelector('#calendar tr');
  let availability = 'Available times:\n';

  selectedCells.forEach(cell => {
    const time = cell.parentElement.cells[0].innerText;
    const day = headerRow.cells[cell.cellIndex].innerText;
    const interval = getTimeInterval(time);
    availability += `${day} from ${interval.start} to ${interval.end}\n`;
  });

  const email = 'gcochran@berry.edu';
  const subject = 'Availability for Next Week';
  const body = encodeURIComponent(availability);
  window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
}
