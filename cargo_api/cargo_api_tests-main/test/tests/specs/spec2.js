const chai = require('chai');
chai.use(require('chai-subset'));
chai.use(require('chai-json-schema'));
const Logger = require('../../main/utils/log/logger');
const JSONLoader = require('../../main/utils/data/JSONLoader');
const cargoAPI = require('../API/cargoAPI');

chai.should();

describe('Cargo API test suite:', async () => {
  beforeEach(function () { // eslint-disable-line func-names
    if (!JSONLoader.configData.parallel) Logger.log(this.currentTest.title);
  });

  it('Test contracts:', async () => { // eslint-disable-next-line prefer-const
    let { response } = await cargoAPI.contractsCreate();
    response.status.should.be.equal(200);
    response = await cargoAPI.contracts();
    response.status.should.be.equal(200);
    response.data.should.containSubset(JSONLoader.templateResponse.contracts);
    if (global.withESBD) {
      response.data.should.be.jsonSchema(JSONLoader.contractsResponseSchema);
    } else {
      response.data.should.be.jsonSchema(JSONLoader.contractsWithoutESBDResponseSchema);
    }
  });

  it('Test contracts/by-external-id:', async () => { // eslint-disable-next-line prefer-const
    let { response, requestBody } = await cargoAPI.contractsCreate();
    response.status.should.be.equal(200);
    const externalId = requestBody.external_id;
    response = await cargoAPI.contractsByExternalId(externalId);
    response.status.should.be.equal(200);
    response.data.should.containSubset(JSONLoader.templateResponse.contracts);
    if (global.withESBD) {
      response.data.should.be.jsonSchema(JSONLoader.contractsByExternalIdOrNumberResponseSchema);
    } else {
      response.data.should.be
        .jsonSchema(JSONLoader.contractsByExternalIdOrNumberWithoutESBDResponseSchema);
    }
  });

  it('Test contracts/{number}:', async () => { // eslint-disable-next-line prefer-const
    let { response } = await cargoAPI.contractsCreate();
    response.status.should.be.equal(200);
    const { number } = response.data.data;
    response = await cargoAPI.contractsByNumber(number);
    response.status.should.be.equal(200);
    response.data.should.containSubset(JSONLoader.templateResponse.contracts);
    if (global.withESBD) {
      response.data.should.be.jsonSchema(JSONLoader.contractsByExternalIdOrNumberResponseSchema);
    } else {
      response.data.should.be
        .jsonSchema(JSONLoader.contractsByExternalIdOrNumberWithoutESBDResponseSchema);
    }
  });

  it('Test contracts/premium', async () => { // eslint-disable-next-line prefer-const
    const response = await cargoAPI.contractsPremium();
    response.status.should.be.equal(200);
    response.data.should.be.jsonSchema(JSONLoader.contractsPremiumResponseSchema)
      .and.containSubset(JSONLoader.templateResponse.contractsPremium);
  });

  afterEach(function () { // eslint-disable-line func-names
    if (!JSONLoader.configData.parallel
      && this.currentTest.state) Logger.log(this.currentTest.state);
  });
});
