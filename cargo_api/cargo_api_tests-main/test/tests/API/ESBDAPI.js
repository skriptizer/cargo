const path = require('path');
const authAPI = require('./authAPI');
const BaseAPI = require('../../main/utils/API/baseAPI');
const JSONLoader = require('../../main/utils/data/JSONLoader');
require('dotenv').config({ path: path.join(__dirname, '../../../', '.env.test'), override: true });

class ESBDAPI extends BaseAPI {
  #API;

  #options;

  constructor(options = {
    baseURL: '' || process.env.GATEWAY_URL,
  }) {
    super(options);
    this.#options = options;
  }

  async setToken() {
    const response = await authAPI.auth({ APIName: 'ESBD API' });
    this.#options.headers = {};
    this.#options.headers.Authorization = `Bearer ${response.data.data.access_token}`;
    this.#API = new ESBDAPI(this.#options);
  }

  async getContractDsCargoByNumber(aContractNumber) {
    const params = {
      methodName: 'GetContractDsCargo_By_Number',
      params: {
        aContractNumber,
      },
    };

    return this.#API.post(JSONLoader.APIEndpoints.ESBD.callMethod, params);
  }
}

module.exports = new ESBDAPI();
