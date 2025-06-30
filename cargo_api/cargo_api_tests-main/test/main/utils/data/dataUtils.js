const fs = require('fs');
const JSONMapper = require('./JSONMapper');
const JSONLoader = require('./JSONLoader');

class DataUtils {
  static saveToJSON(obj) {
    const [name] = Object.keys(obj);
    const data = obj[name];
    const replacer = (key, value) => (typeof value === 'undefined' ? null : value);
    fs.writeFileSync(`./test/artifacts/${name}.json`, JSON.stringify(data, replacer, 4));
  }

  static passBugsTWB(mappedData, getPolicyData) {
    const outputData = { ...mappedData };
    // Pass TWB bug with "verify_bool" value without verification
    if (getPolicyData.contracts[0].verify_bool === 1
    && outputData['contracts.0.verify_bool'] === 0) {
      outputData['contracts.0.verify_bool'] = getPolicyData.contracts[0].verify_bool;
    }
    return outputData;
  }

  static async mapRequestToOnes(getPolicyData, requestData, optionalSchema) {
    this.saveToJSON({ getPolicyData });
    let mappedData = JSONMapper.mapValues(
      { getPolicyData },
      { requestData },
      optionalSchema ?? JSONLoader.requestToGetPolicyMapSchema,
    );
    const dateBeginKey = JSONMapper.getNestedProperty(mappedData, 'date_begin').keys.pop();
    const dateEndKey = JSONMapper.getNestedProperty(mappedData, 'date_end').keys.pop();
    const descriptionKey = JSONMapper.getNestedProperty(mappedData, 'description').keys.pop();

    const dateBegin = mappedData[dateBeginKey];
    const dateEnd = mappedData[dateEndKey];
    const shipmentNumber = mappedData[descriptionKey];

    if (dateBegin && dateEnd && shipmentNumber) {
      mappedData[descriptionKey] = `Груз. Рейс: ${shipmentNumber}. ${dateBegin} - ${dateEnd}`;
    }

    mappedData = this.passBugsTWB(mappedData, getPolicyData);

    const requestToOnesMappedData = JSONMapper.unflattenJSON(mappedData);
    this.saveToJSON({ requestData });
    this.saveToJSON({ requestToOnesMappedData });
    return requestToOnesMappedData;
  }

  static mapESBDToOnes(
    getPolicyData,
    getContractByNumberData,
  ) {
    this.saveToJSON({ getPolicyData });

    let mappedData = JSONMapper.mapValues(
      { getPolicyData },
      { getContractByNumberData },
      JSONLoader.getContractByNumberToGetPolicyMapSchema,
    );

    mappedData = this.passBugsTWB(mappedData, getPolicyData);
    const rewritedData = JSONMapper.rewriteValues(
      mappedData,
      JSONLoader.dictOnes,
      JSONLoader.dictESBD,
    );

    const ESBDToOnesMappedData = JSONMapper.unflattenJSON(rewritedData);
    this.saveToJSON({ ESBDToOnesMappedData });
    this.saveToJSON({ getContractByNumberData });
    return ESBDToOnesMappedData;
  }
}

module.exports = DataUtils;
