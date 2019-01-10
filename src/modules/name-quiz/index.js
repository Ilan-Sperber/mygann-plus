import classNames from 'classnames';

import registerModule from '~/module';

import { createElement, waitForLoad, constructButton, insertCss } from '~/utils/dom';
import Dialog from '~/utils/dialog';

import style from './style.css';
import { getNicknames, setNickname, removeNickname, getMode, setMode } from './name-quiz-modal';

const getRandomItem = arr => arr[Math.floor(Math.random() * arr.length)];
const getFirstName = fullName => fullName.split(' ')[0];
const capitalize = str => str[0].toUpperCase() + str.substring(1);
const removeStudent = (students, student) => students.filter(s => s.name !== student.name);

const selectors = {
  playButton: style.locals['play-button'],
  wrap: style.locals.wrap,
  wrongAnswer: style.locals['wrong-answer'],
  imageWrap: style.locals['image-wrap'],
  input: style.locals.input,
  hint: style.locals.hint,
  image: style.locals.image,
  points: style.locals.points,
  settingsButton: style.locals['settings-button'],
  upperRightWrap: style.locals['upper-right-wrap'],
  multipleChoice: {
    wrap: style.locals['Multiple-Choice--wrap'],
    box: style.locals['Multiple-Choice--box'],
  },
  settings: {
    nicknameRemove: style.locals['Settings--nickname-remove'],
    nicknameRow: 'mgp_name-quiz_nickname-row',
  },
};

const modes = {
  TYPE: 'Type Answer',
  CHOICE: 'Multiple Choice',
};

class NameQuizGame {

  constructor(students, nicknames, mode) {
    this.students = students;
    this.nicknames = nicknames;
    this.mode = mode;
    this.correctAnswer = null;
    this.points = 0;
    this.shownStudents = [];
    this.hintLength = 0;
    this.createGameElements();
    this.updateInputType();
  }

  /* PUBLIC METHODS */

  beginGame() {
    this.elements.input.focus();
    this.generateNewQuestion();
  }
  getWrap() {
    return this.elements.wrap;
  }

  nextTurn() {
    this.turns++;
    this.elements.input.value = '';
    this.generateNewQuestion();
  }

  incrementPoints() {
    this.points++;
    this.elements.points.textContent = `${this.points} points`;
  }

  generateNewQuestion() {
    let student = getRandomItem(this.students);
    if (this.shownStudents.length === this.students.length) {
      this.shownStudents = [];
    }
    if (this.currentStudent) {
      while (this.currentStudent.image === student.image || this.shownStudents.includes(student.name)) {
        student = getRandomItem(this.students);
      }
    }
    this.currentStudent = student;
    this.correctAnswer = this.getStudentName(student);
    this.elements.image.src = student.image;
    if (this.mode === modes.CHOICE) {
      this.generateNewMultipleChoiceBoxes(student);
    }
    this.shownStudents.push(student.name);
  }

  generateNewMultipleChoiceBoxes(student) {
    const correctIndex = Math.floor(Math.random() * 3);
    this.correctIndex = correctIndex;
    const otherStudents = removeStudent(this.students, student);
    for (let i = 0; i < 3; i++) {
      const box = this.elements.multipleChoiceBoxes[i];
      if (i === correctIndex) {
        box.textContent = this.getStudentName(student);
      } else {
        box.textContent = this.getStudentName(getRandomItem(otherStudents));
      }
    }
  }

  getStudentName(student) {
    const nickname = this.nicknames[student.name];
    return nickname ? capitalize(nickname) : getFirstName(student.name);
  }

  /* EVENT LISTENERS */

  handleInput(e) {
    this.elements.wrap.classList.remove(selectors.wrongAnswer);
    if (e.key === 'Enter') {
      if (e.target.value.toLowerCase().trim() === this.correctAnswer.toLowerCase().trim()) {
        this.incrementPoints();
        this.hideHint();
        this.nextTurn();
      } else {
        this.elements.wrap.classList.add(selectors.wrongAnswer);
        this.showHint();
      }
    }
  }
  handleChoiceClick(e) {
    if (e.target.textContent === this.correctAnswer) {
      e.target.blur();
      this.incrementPoints();
      this.nextTurn();
    }
  }
  handleNicknameClick(e) {
    e.preventDefault();
    const nickname = prompt(`Nickname for ${this.currentStudent.name}`); // eslint-disable-line no-alert
    if (!nickname) {
      return;
    }
    this.nicknames[this.currentStudent.name] = nickname;
    this.correctAnswer = nickname;
    setNickname(this.currentStudent.name, nickname);
    if (this.mode === modes.CHOICE) {
      this.elements.multipleChoiceBoxes[this.correctIndex].textContent = nickname;
    }
  }
  updateInputType() {
    switch (this.mode) {
      case modes.TYPE:
        this.elements.multipleChoiceWrap.style.display = 'none';
        this.elements.input.style.display = '';
        break;
      case modes.CHOICE:
        this.elements.multipleChoiceWrap.style.display = '';
        this.elements.input.style.display = 'none';
        if (this.currentStudent) {
          this.generateNewMultipleChoiceBoxes(this.currentStudent);
        }
        break;
      default:
        break;
    }
  }

  showHint() {
    this.hintLength++;
    const letters = this.getStudentName(this.currentStudent).substring(0, this.hintLength);
    this.elements.hint.textContent = `Hint: ${letters}`;
  }
  hideHint() {
    this.hintLength = 0;
    this.elements.hint.textContent = '';
  }

  createGameElements() {
    this.elements = {};
    const image = (
      <img className={ selectors.image }></img>
    );
    const imageWrap = <div className={ selectors.imageWrap }>{ image }</div>;
    const input = (
      <input
        placeholder="Student Name"
        onKeyUp={ e => this.handleInput(e) }
        className={ selectors.input }
      ></input>
    );
    const createMultipleChoiceBox = () => (
      constructButton(
        '', '', '',
        e => this.handleChoiceClick(e), selectors.multipleChoice.box,
      )
    );
    const multipleChoiceBoxes = [
      createMultipleChoiceBox(),
      createMultipleChoiceBox(),
      createMultipleChoiceBox(),
    ];
    const multipleChoiceWrap = (
      <div className={ selectors.multipleChoice.wrap }>
        { multipleChoiceBoxes }
      </div>
    );
    const settings = (
      <span className={ selectors.settingsButton } onClick={ e => this.handleSettingsClick(e) }>
        <i className="fa fa-cog"></i>
      </span>
    );
    const hint = <span className={ selectors.hint }></span>;
    const points = <span className={ selectors.points }>0 points</span>;
    const nickname = <a href="#" onClick={ e => this.handleNicknameClick(e) }>Add nickname...</a>;
    const wrap = (
      <div className={ selectors.wrap }>
        { imageWrap }
        { input }
        { hint }
        { multipleChoiceWrap }
        <div className={ selectors.upperRightWrap }>
          { settings }
          { points }
        </div>
        { nickname }
      </div>
    );
    this.elements.image = image;
    this.elements.input = input;
    this.elements.hint = hint;
    this.elements.points = points;
    this.elements.multipleChoiceWrap = multipleChoiceWrap;
    this.elements.multipleChoiceBoxes = multipleChoiceBoxes;
    this.elements.nickname = nickname;
    this.elements.wrap = wrap;
  }

  /* SETTINGS */

  generateSettingsDialog() {
    return (
      <div>
        <b>Mode: </b>
        <select onChange={ e => this.selectMode(e.target.value) }>
          {
            Object.values(modes).map(mode => (
              <option selected={ mode === this.mode }>
                { mode }
              </option>
            ))
          }
        </select>
        <br />
        <b>Nicknames:</b>
        <ul>
          {
            Object.keys(this.nicknames).map(fullName => (
              <li className={ selectors.settings.nicknameRow }>
                { fullName }: { this.nicknames[fullName] }
                <i
                  className={ classNames('fa fa-times', selectors.settings.nicknameRemove) }
                  onClick={ e => this.handleNicknameRemoveClick(e, fullName) }
                >
                </i>
              </li>
            ))
          }
        </ul>
      </div>
    );
  }

  handleSettingsClick() {
    const dialog = new Dialog('Name Quiz Options', this.generateSettingsDialog(), {
      leftButtons: [Dialog.buttons.CLOSE],
    });
    dialog.open();
  }
  selectMode(mode) {
    if (mode !== this.mode) {
      this.mode = mode;
      this.updateInputType();
    }
    this.mode = mode;
    setMode(mode);
  }
  handleNicknameRemoveClick(e, fullName) {
    e.target.closest(`.${selectors.settings.nicknameRow}`).remove();
    delete this.nicknames[fullName];
    removeNickname(fullName);
  }
  funny() {
    setInterval(() => {
      this.generateNewQuestion();
    }, 1);
  }
}

async function runGame(unloaderContext) {
  let students = Array.from(document.querySelectorAll('.bb-card'))
    .filter(card => (
      card.querySelector('.bb-card-title').textContent !== 'Teacher' &&
      card.querySelector('.bb-avatar-image')
    ))
    .map(card => ({
      name: card.querySelector('.bb-card-title').textContent,
      image: card.querySelector('.bb-avatar-image').src,
    }));

  if (!students.length) {
    return alert('There are no students in this class.'); // eslint-disable-line no-alert
  }

  const nicknames = await getNicknames();
  const mode = (await getMode()) || modes.CHOICE;
  const game = new NameQuizGame(students, nicknames, mode);

  const rosterBar = window.location.hash.startsWith('#communitypage') ?
    document.querySelector('#communitypagecontainer div') :
    document.querySelector('#academicclassmaincontainer div');

  rosterBar.after(game.getWrap());
  unloaderContext.addRemovable(game.getWrap());
  game.beginGame();
}

function handleButtonClick(unloaderContext) {
  if (!document.querySelector(`.${selectors.wrap}`)) {
    runGame(unloaderContext);
  }
}

const domQuery = () => document.querySelector('#roster-term-picker');

async function nameQuiz(opts, unloaderContext) {
  const styles = insertCss(style.toString());
  unloaderContext.addRemovable(styles);

  const termButton = await waitForLoad(domQuery);
  const button = constructButton(
    'Name Quiz', '', '',
    () => handleButtonClick(unloaderContext),
    selectors.playButton,
  );
  termButton.before(button);
  unloaderContext.addRemovable(button);
}

export default registerModule('{2b9653de-c88c-4885-b43c-1845f8879e0f}', {
  name: 'Roster Name Quiz',
  description: 'Quiz to help you learn students\' names',
  main: nameQuiz,
});