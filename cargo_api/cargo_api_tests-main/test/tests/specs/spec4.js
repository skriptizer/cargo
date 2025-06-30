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

  it('Test contracts/backdated/create:', async () => { // eslint-disable-next-line prefer-const
    const response = await cargoAPI.contractsBackDatedCreate();

    if (cargoAPI.user.login.includes('biny')) {
      response.status.should.be.equal(200);
      response.data.should.be.jsonSchema(JSONLoader.contractsCreateResponseSchema)
        .and.containSubset(JSONLoader.templateResponse.contractsCreate);
      return;
    }

    response.status.should.be.equal(422);
    response.data.should.be.jsonSchema(JSONLoader.contractsBackdatedCarNetResponseSchema)
      .and.containSubset(JSONLoader.templateResponse.contractsBackdatedCarNet);
  });

  it('Test requests/backdated/create contracts/backdated/issue:', async () => { // eslint-disable-next-line prefer-const
    let response = await cargoAPI.requestsBackdatedCreate();

    if (cargoAPI.user.login.includes('biny')) {
      response.status.should.be.equal(200);
      response.data.should.be.jsonSchema(JSONLoader.requestsCreateResponseSchema)
        .and.containSubset(JSONLoader.templateResponse.requestsCreate);

      response = await cargoAPI.contractsBackDatedIssue();
      response.status.should.be.equal(200);
      response.data.should.be.jsonSchema(JSONLoader.contractsIssueResponseSchema)
        .and.containSubset(JSONLoader.templateResponse.contractsIssue);
      return;
    }

    response.status.should.be.equal(422);
    response.data.should.be.jsonSchema(JSONLoader.contractsBackdatedCarNetResponseSchema)
      .and.containSubset(JSONLoader.templateResponse.contractsBackdatedCarNet);
  });

  it('Test requests/backdated/delete:', async () => { // eslint-disable-next-line prefer-const
    let response = await cargoAPI.requestsBackdatedCreate();

    if (cargoAPI.user.login.includes('biny')) {
      response.status.should.be.equal(200);
      response.data.should.be.jsonSchema(JSONLoader.requestsCreateResponseSchema)
        .and.containSubset(JSONLoader.templateResponse.requestsCreate);
      const externalId = { external_id: response.data.data.external_id };

      response = await cargoAPI.requestsBackdatedDelete(externalId);
      response.status.should.be.equal(200);
      response.data.should.be.jsonSchema(JSONLoader.requestsDeleteResponseSchema)
        .and.containSubset(JSONLoader.templateResponse.requestsDelete);
      return;
    }

    response.status.should.be.equal(422);
    response.data.should.be.jsonSchema(JSONLoader.contractsBackdatedCarNetResponseSchema)
      .and.containSubset(JSONLoader.templateResponse.contractsBackdatedCarNet);
  });

  afterEach(function () { // eslint-disable-line func-names
    if (!JSONLoader.configData.parallel
      && this.currentTest.state) Logger.log(this.currentTest.state);
  });
});
