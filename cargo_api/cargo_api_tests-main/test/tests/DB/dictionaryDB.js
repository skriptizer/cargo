const path = require('path');
const BaseDB = require('../../main/utils/DB/baseDB');
require('dotenv').config({ path: path.join(__dirname, '../../../', '.env.test'), override: true });

class DictionaryDB extends BaseDB {
  constructor() {
    super(
      '' || process.env.DB_HOST,
      '' || process.env.DB_USERNAME,
      '' || process.env.DB_PASSWORD,
      '' || process.env.DB_DICTIONARY_DATABASE,
      '' || process.env.DB_PORT,
    );
  }

  async getGeneralContractNumber(partner) {
    const select = (await this.sqlSelect(
      'general_contracts',
      'id, number',
      'WHERE provider IN (?) ORDER BY `id` DESC LIMIT 1',
      [partner],
      { hasLogger: false },
    )).pop();
    return select.number;
  }

  async getPartnerId(partner) {
    const select = (await this.sqlSelect(
      'general_contracts',
      'id',
      'WHERE provider IN (?) ORDER BY `id` DESC LIMIT 1',
      [partner],
      { hasLogger: false },
    )).pop();
    return select.id;
  }

  async getInsuranceLimit(partner) {
    const select = (await this.sqlSelect(
      'general_contracts',
      'insurance_limit',
      'WHERE provider IN (?) ORDER BY `id` DESC LIMIT 1',
      [partner],
      { hasLogger: false },
    )).pop();
    return select.insurance_limit;
  }

  async getCargoCategory(partnerId) {
    const select = (await this.sqlSelect(
      'cargo_programs',
      'DISTINCT category_id',
      'WHERE contract_id IN (?)',
      [partnerId],
      { hasLogger: false },
    ));
    return select.map((row) => row.category_id);
  }

  async getTransportationType(partnerId) {
    const select = (await this.sqlSelect(
      'cargo_programs',
      'DISTINCT type_id',
      'WHERE contract_id IN (?)',
      [partnerId],
      { hasLogger: false },
    ));
    return select.map((row) => row.type_id);
  }
}

module.exports = new DictionaryDB();
