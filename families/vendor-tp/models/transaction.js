// Definition of Transaction model.

function Transaction(attrs = {}) {
	this.attrs = attrs;
}

function isNullOrWhiteSpace(str) {
  return (!str || str.length === 0 || /^\s*$/.test(str))
}

Transaction.prototype = {
	errors: [],
	isValid(isAppointMent) {
		const attrs = this.attrs;
		this.errors = [];
		if (!attrs.action) {
			this.errors.push("Action is required");
		}

		if (!attrs.asset) {
			this.errors.push("Asset is required");
		} else {
			if (attrs.isMessage && attrs.isMessage !== "vendorUser") {
				let assetjson = JSON.parse(attrs.asset);
				if (isNullOrWhiteSpace(assetjson.SKU)) {
					this.errors.push("SKU is required in asset");
				}

				if (isNullOrWhiteSpace(assetjson.Manufacturer)) {
					this.errors.push("Manufacturer is required in asset");
				}
			}
		}

		if (isNullOrWhiteSpace(attrs.owner)) {
			this.errors.push("Owner is required");
		}

		if (!attrs.isMessage) {
			this.errors.push("Message is required");
		}

		if (!attrs.time) {
			this.errors.push("Time is required");
		}

		if (!(attrs.action === "create")) {
			this.errors.push('Action must be "create" ');
		}

		return this.errors.length === 0;
	}
};

module.exports = Transaction;
