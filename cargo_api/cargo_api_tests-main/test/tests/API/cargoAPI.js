const path = require('path');
const authAPI = require('./authAPI');
const BaseAPI = require('../../main/utils/API/baseAPI');
const TimeUtils = require('../../main/utils/time/timeUtils');
const JSONLoader = require('../../main/utils/data/JSONLoader');
const Randomizer = require('../../main/utils/random/randomizer');
require('dotenv').config({ path: path.join(__dirname, '../../../', '.env.test'), override: true });

class CargoAPI extends BaseAPI {
  #API;

  #user;

  #options;

  constructor(options = {
    baseURL: '' || process.env.GATEWAY_URL,
  }) {
    super(options);
    this.#options = options;
  }

  get user() {
    return this.#user;
  }

  async setToken() {
    this.#user = await authAPI.getTestUser();
    const response = await authAPI.auth({ user: this.#user, APIName: 'Cargo API' });
    this.#options.headers = {};
    this.#options.headers.Authorization = `Bearer ${response.data.data.access_token}`;
    this.#API = new CargoAPI(this.#options);
  }

  async contracts() {
    const randomInterval = Math.floor(Math.random() * 31) + 1;
    const datesInterval = TimeUtils.getDatesInterval(
      randomInterval,
      'days',
      {
        reversInterval: true,
        startNextDay: false,
      },
    );

    const params = {
      from: datesInterval.startDate,
      to: datesInterval.finishDate,
      gen_contract_num: JSONLoader.testData.genContractNum,
    };

    return this.#API.get(JSONLoader.APIEndpoints.cargo.contracts, params);
  }

  async contractsByExternalId(id) {
    return this.#API.get(`${JSONLoader.APIEndpoints.cargo.contractsByExternalId}/${id}`);
  }

  async contractsByNumber(contractsNumber) {
    const params = {
      with_base64: 0,
    };

    return this.#API.get(`${JSONLoader.APIEndpoints.cargo.contractsByNumber}/${contractsNumber}`, params);
  }

  async requestsCreate() {
    let params = JSONLoader.templateContracts;
    params = await Randomizer.randomizeContractsPremium(this.#user.login, params);

    return this.#API.post(JSONLoader.APIEndpoints.cargo.requestsCreate, params);
  }

  async deleteRequests(params) {
    return this.#API.delete(JSONLoader.APIEndpoints.cargo.requestsDelete, params);
  }

  async contractsCreate() {
    let params = JSONLoader.templateContracts;
    params = await Randomizer.randomizeContractsPremium(this.#user.login, params);
    const response = await this.#API.post(JSONLoader.APIEndpoints.cargo.contractsCreate, params);

    return { requestBody: params, response };
  }

  async contractsCancel(contractNumber) {
    const params = {
      contractNumber,
    };

    return this.#API.post(JSONLoader.APIEndpoints.cargo.contractsCancel, {
      contract_number: params.contractNumber,
    });
  }

  async contractsBackDatedCreate() {
    let params = JSONLoader.templateContracts;
    params = await Randomizer.randomizeContractsPremium(this.#user.login, params);

    params.waybills.forEach((waybill) => {
      const { startDate } = TimeUtils
        .getDatesInterval(...JSONLoader.testData.timeIncrement, { reverseInterval: true });
      const updatedWaybill = { ...waybill, date_begin: startDate };
      Object.assign(waybill, updatedWaybill);
    });

    return this.#API.post(JSONLoader.APIEndpoints.cargo.contractsBackdatedCreate, params);
  }

  async contractsBackDatedIssue() {
    return this.#API.post(JSONLoader.APIEndpoints.cargo.contractsBackdatedIssue);
  }

  async contractsDraft() {
    return this.#API.post(JSONLoader.APIEndpoints.cargo.contractsDraft);
  }

  async contractsIssue() {
    return this.#API.post(JSONLoader.APIEndpoints.cargo.contractsIssue);
  }

  async requestsBackdatedCreate() {
    let params = JSONLoader.templateContracts;
    params = await Randomizer.randomizeContractsPremium(this.#user.login, params);

    params.waybills.forEach((waybill) => {
      const { startDate } = TimeUtils
        .getDatesInterval(...JSONLoader.testData.timeIncrement, { reverseInterval: true });
      const updatedWaybill = { ...waybill, date_begin: startDate };
      Object.assign(waybill, updatedWaybill);
    });

    return this.#API.post(JSONLoader.APIEndpoints.cargo.requestsBackdatedCreate, params);
  }

  async contractsPremium() {
    let params = JSONLoader.templateContracts;
    params = await Randomizer.randomizeContractsPremium(this.#user.login, params);
    return this.#API.post(JSONLoader.APIEndpoints.cargo.contractsPremium, params);
  }

  async requestsBackdatedDelete(params) {
    return this.#API.delete(JSONLoader.APIEndpoints.cargo.requestsBackdatedDelete, params);
  }
}

module.exports = new CargoAPI();
