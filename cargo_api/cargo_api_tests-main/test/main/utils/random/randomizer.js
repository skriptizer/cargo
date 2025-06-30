const moment = require('moment');
const JSONLoader = require('../data/JSONLoader');
const TimeUtils = require('../time/timeUtils');
const dictionaryDB = require('../../../tests/DB/dictionaryDB');

class Randomizer {
  static getRandomDatesIntervalFromTomorrow(count, unitOfTime) {
    const nextDayObject = moment().add(1, 'days').startOf('day');
    const unixOne = nextDayObject.unix();
    const unixTwo = moment(moment().add(1, 'days').startOf('day')).add(count, unitOfTime).unix();

    const startDateUnix = moment.unix(this.getRandomFloat(unixOne, unixTwo)).unix();
    let finishDateUnix;
    do {
      finishDateUnix = moment.unix(this.getRandomFloat(startDateUnix, unixTwo)).unix();
    } while ((finishDateUnix - startDateUnix) < 86400 * 2);

    const startDateObject = moment.unix(startDateUnix).startOf('day');
    const finishDateObject = moment.unix(finishDateUnix).startOf('day');
    const startDate = startDateObject.format(JSONLoader.testData.datesFormat);
    const finishDate = finishDateObject.format(JSONLoader.testData.datesFormat);

    const daysDifferenceIncluded = finishDateObject.diff(startDateObject, 'days') + 1;

    const getAbsoluteMonth = (date) => {
      const months = Number(moment(date, JSONLoader.testData.datesFormat).format('MM'));
      const years = Number(moment(date, JSONLoader.testData.datesFormat).format('YYYY'));
      return months + (years * 12);
    };

    const currentMonth = getAbsoluteMonth(moment.unix(unixOne)
      .format(JSONLoader.testData.datesFormat));
    const startMonth = getAbsoluteMonth(startDate);
    const finishMonth = getAbsoluteMonth(finishDate);
    let startMonthDifference = startMonth - currentMonth;
    let finishMonthDifference = finishMonth - currentMonth;

    if (nextDayObject.date() === 1) startMonthDifference += 1;
    if (nextDayObject.date() === 1) finishMonthDifference += 1;

    return {
      startDate,
      finishDate,
      startMonthDifference,
      finishMonthDifference,
      daysDifferenceIncluded,
    };
  }

  static getRandomString(
    hasLowerCase = false,
    hasUpperCase = false,
    hasNumber = false,
    hasCyrillic = false,
    chosenLetter = false,
    minLength = 1,
    maxLength = 10,
  ) {
    const upperCaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerCaseLetters = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const cyrillicLetters = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';

    const length = this.getRandomInteger(maxLength, minLength);

    let randomString = '';
    if (chosenLetter) randomString += chosenLetter;

    let requiredCharacters = '';
    if (hasLowerCase) {
      requiredCharacters
      += lowerCaseLetters.charAt(Math.floor(Math.random() * lowerCaseLetters.length));
    }

    if (hasUpperCase) {
      requiredCharacters
      += upperCaseLetters.charAt(Math.floor(Math.random() * upperCaseLetters.length));
    }

    if (hasNumber) {
      requiredCharacters
      += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }

    if (hasCyrillic) {
      requiredCharacters
      += cyrillicLetters.charAt(Math.floor(Math.random() * cyrillicLetters.length));
    }

    randomString += requiredCharacters;

    const characters = (hasLowerCase ? lowerCaseLetters : '')
    + (hasUpperCase ? upperCaseLetters : '')
    + (hasNumber ? numbers : '')
    + (hasCyrillic ? cyrillicLetters : '');
    const charactersLength = characters.length;
    const randomLength = length - randomString.length;

    for (let i = 0; i < randomLength; i += 1) {
      randomString += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return this.stringShuffler(randomString);
  }

  static stringShuffler(inputString) {
    const array = inputString.split('');
    let currentIndex = array.length;
    let temporaryValue;
    let randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array.join('');
  }

  static getRandomInteger(max = 9, min = 0) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }

  static async randomizeContractsPremium(login, requestData) {
    const params = { ...requestData };
    const randomInterval = Math.floor(Math.random() * 31 + 1);
    const datesInterval = TimeUtils.getDatesInterval(
      randomInterval,
      'days',
      {
        reversInterval: true,
        startNextDay: false,
      },
    );

    if (login.includes('biny')) {
      const partnerId = await dictionaryDB.getPartnerId('Biny');
      params.gen_contract_num = await dictionaryDB.getGeneralContractNumber('Biny');
      const insuranceLimit = await dictionaryDB.getInsuranceLimit('Biny');
      const cargoCategory = await dictionaryDB.getCargoCategory(partnerId);
      const transportationType = await dictionaryDB.getTransportationType(partnerId);
      params.waybills = params.waybills.map((waybill) => ({
        ...waybill,
        country_from: JSONLoader.testData.countries[1],
        country_to: JSONLoader.testData.countries[2],
        country_temporary: [
          JSONLoader.testData.countries[1],
          JSONLoader.testData.countries[2],
        ],
        transportation_type: transportationType[
          this.getRandomInteger(0, transportationType.length - 1)
        ],
        items: waybill.items.map((item) => ({
          ...item,
          insured_sum: Randomizer.getRandomFloat(100000, insuranceLimit).toFixed(2),
          cargo_category: cargoCategory[this.getRandomInteger(0, cargoCategory.length - 1)],
        })),
      }));
    }

    if (login.includes('carnet')) {
      const partnerId = await dictionaryDB.getPartnerId('CarNet');
      params.gen_contract_num = await dictionaryDB.getGeneralContractNumber('CarNet');
      const insuranceLimit = await dictionaryDB.getInsuranceLimit('CarNet');
      const cargoCategory = await dictionaryDB.getCargoCategory(partnerId);
      const transportationType = await dictionaryDB.getTransportationType(partnerId);
      params.waybills = params.waybills.map((waybill) => ({
        ...waybill,
        country_from: JSONLoader.testData.countries[0],
        country_to: JSONLoader.testData.countries[1],
        country_temporary: [JSONLoader.testData.countries[0]],
        transportation_type: transportationType[
          this.getRandomInteger(0, transportationType.length - 1)
        ],
        items: waybill.items.map((item) => ({
          ...item,
          insured_sum: Randomizer.getRandomFloat(100000, insuranceLimit).toFixed(2),
          cargo_category: cargoCategory[this.getRandomInteger(0, cargoCategory.length - 1)],
        })),
      }));
    }

    params.external_id = this.getRandomString(false, false, true, false, false, 20, 20);
    params.waybills = params.waybills.map((waybill) => ({
      ...waybill,
      is_last_mile: 0,
      invoice: this.getRandomString(false, true, true, true, false, 8, 10),
      waybill: this.getRandomString(false, true, true, true, false, 8, 10),
      shipment_num: this.getRandomString(false, true, true, true, false, 10, 15),
      date_begin: datesInterval.startDate,
      date_end: datesInterval.finishDate,
      city_from: JSONLoader.testData.cities[
        this.getRandomInteger(0, JSONLoader.testData.cities.length - 1)],
      city_to: JSONLoader.testData.cities[
        this.getRandomInteger(0, JSONLoader.testData.cities.length - 1)],
      beneficiary: this.getRandomString(false, true, true, true, false, 8, 10),
      carrier: this.getRandomString(false, true, true, true, false, 8, 10),
      forwarder: this.getRandomString(false, true, true, true, false, 8, 10),
      shipper: this.getRandomString(false, true, true, true, false, 8, 10),
      consignee: this.getRandomString(false, true, true, true, false, 8, 10),
      places: this.getRandomString(false, true, true, true, false, 8, 10),
      items: waybill.items.map((item) => ({
        ...item,
        item_id: this.getRandomString(false, false, true, false, false, 8, 8),
        name: this.getRandomString(true, true, true, false, false, 10, 15),
        quantity: this.getRandomInteger(1, 10),
        is_new: this.getRandomInteger(0, 1),
      })),
    }));

    return params;
  }
}

module.exports = Randomizer;
