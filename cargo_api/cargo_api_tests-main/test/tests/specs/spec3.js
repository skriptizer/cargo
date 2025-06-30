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

  it('Test requests/create contracts/draft contracts/issue:', async () => { // eslint-disable-next-line prefer-const
    let response = await cargoAPI.requestsCreate();

    response.status.should.be.equal(200);
    response.data.should.be.jsonSchema(JSONLoader.requestsCreateResponseSchema)
      .and.containSubset(JSONLoader.templateResponse.requestsCreate);

    response = await cargoAPI.contractsDraft();
    response.status.should.be.equal(200);
    response.data.should.be.jsonSchema(JSONLoader.contractsDraftResponseSchema)
      .and.containSubset(JSONLoader.templateResponse.contractsDraft);

    response = await cargoAPI.contractsIssue();
    response.status.should.be.equal(200);
    response.data.should.be.jsonSchema(JSONLoader.contractsIssueResponseSchema)
      .and.containSubset(JSONLoader.templateResponse.contractsIssue);
  });

  it('Test requests/delete:', async () => { // eslint-disable-next-line prefer-const
    let response = await cargoAPI.requestsCreate();
    response.status.should.be.equal(200);
    response.data.should.be.jsonSchema(JSONLoader.requestsCreateResponseSchema)
      .and.containSubset(JSONLoader.templateResponse.requestsCreate);

    const externalId = { external_id: response.data.data.external_id };
    response = await cargoAPI.deleteRequests(externalId);
    response.status.should.be.equal(200);
    response.data.should.be.jsonSchema(JSONLoader.requestsDeleteResponseSchema)
      .and.containSubset(JSONLoader.templateResponse.requestsDelete);
  });

  afterEach(function () { // eslint-disable-line func-names
    if (!JSONLoader.configData.parallel
      && this.currentTest.state) Logger.log(this.currentTest.state);
  });
});
