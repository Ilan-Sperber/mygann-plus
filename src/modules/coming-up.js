import registerModule from '../utils/module';

import { fetchApi } from '../utils/fetch';
import { waitForLoad, hasParentWithClassName } from '../utils/dom';
import { isLeapYear } from '../utils/date';
import { isCurrentDay } from '../shared/schedule';

function getTommorowDateString() {
  const dateObj = new Date();
  let date = dateObj.getDate();
  let month = dateObj.getMonth();

  // calculate the month rollover
  const thirtyDayMonths = [3, 5, 7, 10];
  if (thirtyDayMonths.indexOf(month) > -1 && date + 1 > 30) {
    month++;
    date = 1;
  } else if (month === 1) {
    if (isLeapYear() && date + 1 > 29) {
      month++;
      date = 1;
    } else if (date + 1 > 28) {
      month++;
      date = 1;
    }
  } else if (date + 1 > 31) {
    month++;
    date = 0;
  } else {
    date++;
  }

  return [month + 1, date, dateObj.getFullYear()].join('%2F');

}

function fetchData() {

  const id = document.getElementById('profile-link').href.split('profile/')[1].split('/')[0];

  const query = `mydayDate=${getTommorowDateString()}&viewerId=${id}&viewerPersonaId=2`;
  const endpoint = `/api/schedule/ScheduleCurrentDayAnnouncmentParentStudent/?${query}`;

  return fetchApi(endpoint)
    .then(d => (
      d.filter(m => m.Announcement !== '')[0].Announcement
    ));
}

function createAlertBox() {
  const html = `
    <div class="alert alert-info" style="margin-top:10px;">
    </div>
  `;
  document.getElementsByClassName('col-md-12')[3].children[1].innerHTML += html;
}

function showComingUp() {
  waitForLoad(() => (
    document.getElementsByClassName('alert alert-info').length ||
    (document.getElementsByClassName('pl-10')[0] &&
    document.getElementsByClassName('pl-10')[0].innerText === 'There is nothing scheduled for this date.')
  ))
    .then(async () => {
      if (isCurrentDay()) {
        const announcements = await fetchData();
        if (!document.getElementsByClassName('alert alert-info').length) {
          createAlertBox();
        }
        if (announcements.length) {
          document.getElementsByClassName('alert alert-info')[0].innerHTML += `<div>- <i>Tommorow: ${announcements}</i></div>`;
        }
      }
    });
}

function addDayChangeListeners() {
  document.body.addEventListener('click', e => {
    if (hasParentWithClassName(e.target, [
      'chCal-button-next', 'chCal-button-prev', 'chCal-button-today',
    ])) {
      // there's a small delay between button click and date change in dom
      setTimeout(showComingUp, 100);
    }
  });
}

function comingUp() {
  showComingUp();
  addDayChangeListeners();
}

export default registerModule('Coming Up', comingUp);
