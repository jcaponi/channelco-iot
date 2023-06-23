// import { createOptimizedPicture } from '../../scripts/lib-franklin.js';

const today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
          day.classList.add('today', 'selected-day');
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
  calendarTable.addEventListener('click', (e) => {
    const sel = document.querySelector('.selected-day');
    sel.className = 'dates';
    e.target.className = 'selected-day';
  });
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
// function previousMonth() {
//   const prevMonthEl = document.querySelector('.prev-month');
//   prevMonthEl.addEventListener('click', (e) => {
//     e.preventDefault();
//     if (currentMonth === 0) {
//       currentMonth = 11;
//       currentYear -= 1;
//     } else {
//       currentMonth -= 1;
//     }
//     renderCalendar(currentMonth, currentYear);
//   });
// }

// function nextMonth() {
//   const nextMonthEl = document.querySelector('.next-month');
//   nextMonthEl.addEventListener('click', (e) => {
//     e.preventDefault();
//     if (currentMonth === 11) {
//       currentMonth = 0;
//       currentYear += 1;
//     }
//     currentMonth += 1;
//     renderCalendar(currentMonth, currentYear);
//   });
// }

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
  // const eventsLink = block.querySelector('a');
  block.innerHTML = '';
  // if (eventsLink.href) {
  //   const eventsRes = await fetch(eventsLink.href);
  //   const eventsJson = await eventsRes.json();
  //   console.log(`eventsJson is ${JSON.stringify(eventsJson)}`);
  // }
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

  renderMonths();
  renderCalendar(currentMonth, currentYear);
  nextYear();
  previousYear();
  // nextMonth();
  // previousMonth();
}
