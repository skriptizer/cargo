const chai = require('chai');
chai.use(require('chai-subset'));
chai.use(require('chai-json-schema'));
const moment = require('moment');
const Logger = require('../../main/utils/log/logger');
const JSONLoader = require('../../main/utils/data/JSONLoader');
const cargoAPI = require('../API/cargoAPI');
const onesAPI = require('../API/onesAPI');
const ESBDAPI = require('../API/ESBDAPI');
const TWBAPI = require('../API/TWBAPI');
const onesDB = require('../DB/onesDB');
const DataUtils = require('../../main/utils/data/dataUtils');

chai.should();
const today = moment().format(JSONLoader.testData.datesFormat);
const setPolicyTWB = async (policyNumber) => {
  if (JSONLoader.configData.setPolicyWaitingTWB) {
    const response = await TWBAPI.startSetPolicyWaiting();
    response.status.should.be.equal(200);
    response.data.should.containSubset(JSONLoader.templateResponse.startSetPolicyWaiting);
  } else {
    const onesContent = await onesDB.getOnesContent(policyNumber);
    const response = await TWBAPI.setPolicy(onesContent);
    response.status.should.be.equal(200);
    response.data.should.containSubset(JSONLoader.templateResponse.setPolicyTWB);
    response.data.message
      .should.be.equal(`Договор №${policyNumber} от ${today} успешно создан!`);
  }
};

const getIssuedPolicy = async (policyNumber) => {
  const getPolicyResponse = JSONLoader.configData.getPolicyTWB
    ? await TWBAPI.getPolicy(policyNumber)
    : await onesAPI.getPolicy(policyNumber);
  getPolicyResponse.status.should.be.equal(200);
  getPolicyResponse.data.contracts[0].policy_status
    .should.be.equal(JSONLoader.dictOnes.policy_status.issued);
  return getPolicyResponse;
};

describe('Cargo API test suite:', async () => {
  beforeEach(function () { // eslint-disable-line func-names
    if (!JSONLoader.configData.parallel) Logger.log(this.currentTest.title);
  });

  it('Test contracts/create:', async () => { // eslint-disable-next-line prefer-const
    let { requestBody, response } = await cargoAPI.contractsCreate();

    response.status.should.be.equal(200);
    if (global.withESBD) {
      response.data.should.be.jsonSchema(JSONLoader.contractsCreateResponseSchema)
        .and.containSubset(JSONLoader.templateResponse.contractsCreate);
    } else {
      response.data.should.be.jsonSchema(JSONLoader.contractsCreateWithoutESBDResponseSchema)
        .and.containSubset(JSONLoader.templateResponse.contractsCreate);
    }
    const contractNumber = response.data.data.number;
    await onesDB.waitStatusCodeUpdate(contractNumber);
    await setPolicyTWB(contractNumber);
    const getPolicyResponse = await getIssuedPolicy(contractNumber);

    const getContractDsCargoByNumberResponse = await ESBDAPI
      .getContractDsCargoByNumber(contractNumber);
    if (global.withESBD) {
      getContractDsCargoByNumberResponse.status.should.be.equal(200);
    } else {
      getContractDsCargoByNumberResponse.status.should.be.equal(404);
    }

    let mappedData = await DataUtils.mapRequestToOnes(
      getPolicyResponse.data,
      requestBody,
    );

    getPolicyResponse.data.should.containSubset(mappedData);
    if (global.withESBD) {
      mappedData = DataUtils.mapESBDToOnes(
        getPolicyResponse.data,
        getContractDsCargoByNumberResponse.data,
      );
      getPolicyResponse.data.should.containSubset(mappedData);
    }
  });

  it('Test contracts/cancel:', async () => { // eslint-disable-next-line prefer-const
    let { response } = await cargoAPI.contractsCreate();
    response.status.should.be.equal(200);
    const contractNumber = response.data.data.number;
    await onesDB.waitStatusCodeUpdate(contractNumber);
    await setPolicyTWB(contractNumber);
    await getIssuedPolicy(contractNumber);

    response = await cargoAPI.contractsCancel(contractNumber);
    if (global.withESBD) {
      response.status.should.be.equal(200);
      response.data.should.be.jsonSchema(JSONLoader.contractsCancelResponseSchema)
        .and.containSubset(JSONLoader.templateResponse.contractsCancel);
      contractNumber.should.equal(response.data.data.contract_number);

      if (JSONLoader.configData.setPolicyWaitingTWB) {
        response = await TWBAPI.startSetPolicyWaiting();
        response.status.should.be.equal(200);
        response.data.should.containSubset(JSONLoader.templateResponse.startSetPolicyWaiting);
      } else {
        response = await TWBAPI.setCancellation(contractNumber);
        response.status.should.be.equal(200);
        response.data.should.containSubset(JSONLoader.templateResponse.setCancellationTWB);
        response.data.message
          .should.be.equal(`Договор №${contractNumber} от ${today} успешно анулирован!`);
      }

      if (JSONLoader.configData.getPolicyTWB) {
        response = await TWBAPI.getPolicy(contractNumber);
        response.status.should.be.equal(422);
        response.data.errors.contracts[0]
          .should.be.equal(JSONLoader.dictOnes.policy_status.cancelled);
      } else {
        response = await onesAPI.getPolicy(contractNumber);
        response.status.should.be.equal(422);
        response.data.error.errors.contracts[0]
          .should.be.equal(JSONLoader.dictOnes.policy_status.cancelled);
      }
    } else {
      response.status.should.be.equal(500);
      await getIssuedPolicy(contractNumber);
    }

    response = await ESBDAPI.getContractDsCargoByNumber(contractNumber);
    if (global.withESBD) {
      response.status.should.be.equal(200);
      response.data.data
        .GetContractDsCargo_By_NumberResult.CONTRACT_DS_CARGO.RESCINDING_REASON_ID
        .should.be.equal(JSONLoader.dictESBD.policy_status.cancelled);
    } else {
      response.status.should.be.equal(404);
    }
  });

  afterEach(function () { // eslint-disable-line func-names
    if (!JSONLoader.configData.parallel
      && this.currentTest.state) Logger.log(this.currentTest.state);
  });
});
