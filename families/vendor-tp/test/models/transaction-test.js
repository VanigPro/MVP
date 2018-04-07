const assert = require('assert'),
  { Transaction } = require('../../models');

describe('Transaction', function() {
  describe('Validation', function() {
    describe('isValid()', function() {
      it('should be false when missing attrs', function() {
        const txn = new Transaction({ asset: 'Product' });
        assert(!txn.isValid());
      });

      it('should store errors when invalid', function() {
        const txn = new Transaction({ asset: 'vendorName' });
        txn.isValid();
        assert(txn.errors.length);
      });

      it('should be true has required attrs', function() {
        const txn = new Transaction({
          asset: 'Product',
          owner: 'vendorName',
          isMessage: 'vendorUser',
          time: new Date(),
          action: 'create'
        });
        assert(txn.isValid());
      });
    });
  });
});
