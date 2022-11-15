import {resetImages} from './images.js';
import {requestData} from './data-base.js';
import {mapFilters} from './filter.js';
import {resetMap} from './map.js';

const MIN_LENGTH = 30;
const MAX_LENGTH = 100;

const adForm = document.querySelector('.ad-form');
const address = adForm.querySelector('#address');
const guestField = adForm.querySelectorAll('#capacity option');
const roomField = adForm.querySelector('#room_number');
const price = adForm.querySelector('#price');
const typeField = adForm.querySelector('#type');
const sliderElement = document.querySelector('.ad-form__slider');
const timeIn = adForm.querySelector('#timein');
const timeOut = adForm.querySelector('#timeout');

const numberOfGuests = {
  1: ['1'],
  2: ['1', '2'],
  3: ['1', '2', '3'],
  100: ['0'],
};

const pricePerNight = {
  min: 0,
  max: 100000,
};

const priceMinRules = {
  flat: 1000,
  bungalow: 0,
  house: 5000,
  palace: 10000,
  hotel: 3000,
};

const pristine = new Pristine(adForm, {
  classTo: 'ad-form__element',
  errorClass: 'ad-form__element--invalid',
  errorTextParent: 'ad-form__element',
  errorTextTag: 'div',
  errorTextClass: 'text-help',
});

const validateTitle = (value) => value.length >= MIN_LENGTH && value.length <= MAX_LENGTH;

pristine.addValidator(
  adForm.querySelector('#title'),
  validateTitle,
  'от 30 до 100 символов'
);

const validateRooms = () => {
  const roomValue = roomField.value;

  guestField.forEach((guest) => {
    const isDidabled = (numberOfGuests[roomValue].indexOf(guest.value) === -1);
    guest.selected = numberOfGuests[roomValue][0] === guest.value;
    guest.disabled = isDidabled;
    guest.hidden = isDidabled;
  });
};

validateRooms();
const onRoomFieldChange = () => validateRooms();
roomField.addEventListener('change', onRoomFieldChange);

noUiSlider.create(sliderElement, {
  range: pricePerNight,
  start: price.placeholder,
  step: 100,
  connect: 'lower',
  format: {
    to: function (value) {
      return value.toFixed(0);
    },
    from: function (value) {
      return parseFloat(value);
    },
  },
});

const validatePrice = () => price.value >= priceMinRules[typeField.value];

const getPriceErrorMessage = () => `минимальная цена для данного типа жилья ${priceMinRules[typeField.value]} рублей`;

pristine.addValidator(
  price,
  validatePrice,
  getPriceErrorMessage
);

typeField.addEventListener('change', () => {
  price.placeholder = priceMinRules[typeField.value];
  sliderElement.noUiSlider.set(price.placeholder);
  pristine.validate(price);
});

sliderElement.noUiSlider.on('change', () => {
  price.value = sliderElement.noUiSlider.get();
});

price.addEventListener('change', () => {
  sliderElement.noUiSlider.set(price.value);
});

const resetSlider = () => {
  price.placeholder = '1000';
  sliderElement.noUiSlider.reset();
};


timeIn.addEventListener('change', () => {
  timeOut.value = timeIn.value;
});

timeOut.addEventListener('change', () => {
  timeIn.value = timeOut.value;
});

/////////////////////////////////////////////////////////////////////////////////////////////

const resetButton = adForm.querySelector('.ad-form__reset');
const successTemlate = document.querySelector('#success').content.querySelector('.success');
const successMessage = successTemlate.cloneNode(true);
const body = document.querySelector('body');
const errorTemplate = document.querySelector('#error').content.querySelector('.error');
const errorMessage = errorTemplate.cloneNode(true);


resetButton.addEventListener('click', (evt) => {
  evt.preventDefault();
  adForm.reset();
  mapFilters.reset();
  resetMap();
  resetSlider();
  resetImages();
});

const onSuccessMessageClick = () => {
  successMessage.remove();

  document.removeEventListener('click', onSuccessMessageClick);
};

const onSuccessMessageKeydown = (evt) => {
  if (evt.key === 'Escape') {successMessage.remove();}

  document.removeEventListener('keydown', onSuccessMessageKeydown);
};

const sendFormSuccess = () => {
  body.appendChild(successMessage);
  document.addEventListener('click', onSuccessMessageClick);
  document.addEventListener('keydown', onSuccessMessageKeydown);
  adForm.reset();
  mapFilters.reset();
  resetMap();
  resetSlider();
  resetImages();
};

const onErrorMessageClick = () => {
  errorMessage.remove();

  document.removeEventListener('click', onErrorMessageClick);
};

const onErrorMessageKeydown = (evt) => {
  if (evt.key === 'Escape') {errorMessage.remove();}

  document.removeEventListener('keydown', onErrorMessageKeydown);
};

const sendFormError = () => {
  body.appendChild(errorMessage);
  document.addEventListener('click', onErrorMessageClick);
  document.addEventListener('keydown', onErrorMessageKeydown);
};

adForm.addEventListener('submit', (evt) => {
  evt.preventDefault();
  if (pristine.validate()) {
    const formData = new FormData(evt.target);
    requestData(sendFormSuccess, sendFormError, 'POST',formData);
  }
});

export {adForm, address, price};
