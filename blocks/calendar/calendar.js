// import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

const today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Converts excel datetime strings to a Date object
 * @returns {Date} Date object
 */
export function getDateFromExcel(date) {
  const excelDate = +date > 99999
    ? new Date(+date * 1000)
    : new Date(Math.round((+date - (1 + 25567 + 1)) * 86400 * 1000));
  return excelDate;
}

/**
 * Adds event across multiple cells that span across event start and end dates
 * @argument {Array} Events array
 */
function renderEvents(events) {
  events.forEach((event) => {
    const {
      startDate,
      endDate,
      eventName,
      eventUrl,
    } = event;

    const eventStart = getDateFromExcel(startDate);
    const eventEnd = getDateFromExcel(endDate);
    // Get all dates between start and end so we know which
    // cells to add this event to.
    const eventDates = [];
    for (let dt = eventStart; dt <= eventEnd; dt.setDate(dt.getDate() + 1)) {
      const newDate = new Date(dt);
      // convert date to YYYYMMDD string that we need to get to the right cell
      const cellId = newDate.toISOString().substring(0, 10).replaceAll('-', '');
      eventDates.push(cellId);
    }
    // Add the event data to all cells that match the dates
    eventDates.forEach((date) => {
      const cell = document.querySelector(`.calendar.block tbody td[id="${date}"]`);
      const eventContent = `
        <div class="event">
          <a class="eventLink" href="${eventUrl}" title="${eventName} starts on ${eventStart} and ends on ${eventEnd}">${eventName}</a>
        </div>
      `;
      cell.innerHTML += eventContent;
      cell.classList.add('event');
    });
  });
}

function renderCalendar(month, year) {
  const firstDayOfTheMonth = (new Date(year, month)).getDay();
  const daysInMonth = 32 - new Date(year, month, 32).getDate();

  const calendarTable = document.getElementById('calendar-body');
  calendarTable.innerHTML = '';
  const yearNum = document.getElementById('yearNum');
  yearNum.innerHTML = `${year}`;

  let date = 1;
  for (let i = 0; i < 6; i += 1) {
    const week = document.createElement('tr');

    for (let j = 0; j < 7; j += 1) {
      if (i === 0 && j < firstDayOfTheMonth) {
        const day = document.createElement('td');
        const dateNum = document.createTextNode('');
        day.appendChild(dateNum);
        week.appendChild(day);
      } else if (date > daysInMonth) {
        break;
      } else {
        const day = document.createElement('td');
        const dateNum = document.createTextNode(date);
        if (date === today.getDate()
            && year === today.getFullYear()
            && month === today.getMonth()) {
          day.title = 'today';
          day.classList.add('today');
        }
        day.appendChild(dateNum);
        week.appendChild(day);
        date += 1;
        day.id = `${year}${String(month + 1).padStart(2, '0')}${String(dateNum.textContent).padStart(2, '0')}`;
        day.classList.add('dates');
      }
    }
    calendarTable.appendChild(week);
  }
  renderEvents(window.eventsData);
}

function renderMonths() {
  allMonths.forEach((month, i) => {
    const months = document.querySelector('.months');
    const monthSpan = document.createElement('span');
    if (currentMonth === i) {
      monthSpan.className = 'selected';
    } else {
      monthSpan.className = 'each-month';
    }
    monthSpan.id = i + 1;
    monthSpan.innerHTML = ` ${month} `;
    months.append(monthSpan);

    monthSpan.addEventListener('click', (e) => {
      if (monthSpan.className !== 'selected') {
        const sel = document.querySelector('.selected');
        sel.className = 'each-month';
        e.target.className = 'selected';
        currentMonth = e.target.id - 1;
        renderCalendar(currentMonth, currentYear);
      }
    });
  });
}

function nextYear() {
  const nextYearEl = document.querySelector('.next-year');
  nextYearEl.addEventListener('click', (e) => {
    e.preventDefault();
    currentYear += 1;
    renderCalendar(currentMonth, currentYear);
  });
}

function previousYear() {
  const prevYearEl = document.querySelector('.prev-year');
  prevYearEl.addEventListener('click', (e) => {
    e.preventDefault();
    currentYear -= 1;
    renderCalendar(currentMonth, currentYear);
  });
}

export default async function decorate(block) {
  const eventsLink = block.querySelector('a');
  block.innerHTML = '';
  // Build out the div structure
  const calendar = `
      <div class="card">
        <div class="year">
          <div class="prev-year">PREV</div>
          <div class="big-year" id="yearNum"></div>
          <div class="next-year">NEXT</div>
        </div>
        <div class="months"></div>
        <hr class="month-line"></div>
        <table class="calendar-table" id="calendar">
          <thead>
            <tr>
              <th class="days-of-week">Sun</th>
              <th class="days-of-week">Mon</th>
              <th class="days-of-week">Tue</th>
              <th class="days-of-week">Wed</th>
              <th class="days-of-week">Thu</th>
              <th class="days-of-week">Fri</th>
              <th class="days-of-week">Sat</th>
            </tr>
          </thead>
          <tbody id="calendar-body"></div>
        </table>
      </div>
    `;
  block.innerHTML += calendar;

  if (eventsLink.href) {
    if (!window.eventsData) {
      const eventsRes = await fetch(eventsLink.href);
      const eventsJson = await eventsRes.json();
      if (eventsJson.data && eventsJson.data.length > 0) {
        window.eventsData = eventsJson.data;
      }
    }
  }
  renderMonths();
  renderCalendar(currentMonth, currentYear);
  nextYear();
  previousYear();
  // nextMonth();
  // previousMonth();
}
