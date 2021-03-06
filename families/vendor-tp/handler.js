"use strict";

const { TransactionHandler } = require("sawtooth-sdk/processor/handler");
const {
	InvalidTransaction,
	InternalError
} = require("sawtooth-sdk/processor/exceptions");
const { TransactionHeader } = require("sawtooth-sdk/protobuf");

const { Transaction } = require("./models");

const {
	getAddress,
	tabAddressGenerate
} = require("./../../common/addressgenerate");

const { FAMILY_VENDOR, VERSION } = require("./../../config");
const PREFIX = getAddress(FAMILY_VENDOR, 6);

const encode = obj => Buffer.from(JSON.stringify(obj, Object.keys(obj).sort()));
const decode = buf => JSON.parse(buf.toString());

const toInternalError = err => {
	let message = err.message ? err.message : err;
	throw new InternalError(message);
};

const createAsset = (txnModel, state) => {
	if (!txnModel.isValid()) {
		console.log("txn model invalid");
		return Promise.resolve().then(() => {
			throw new InvalidTransaction(txnModel.errors[0]);
		});
	}
	const {
		asset,
		owner,
		isMessage,
		bothUserKeys,
		msgDecryptKey,
		time
	} = txnModel.attrs;

	const address = tabAddressGenerate["vendorUser"](PREFIX, owner);
	return state.getState([address]).then(entries => {
		const entry = entries[address];
		if (isMessage === "vendorUser") {
			if (entry && entry.length > 0) {
				throw new InvalidTransaction("User name already in use");
			} else {
				const vendorAddr = tabAddressGenerate["vendorUser"](PREFIX, owner);
				return state.setState({
					[vendorAddr]: encode({
						asset,
						owner,
						isMessage,
						time
					}),
					[address]: encode({ asset, owner, isMessage: "vendorUser", time })
				});
			}
		} else if (isMessage === "listedItems") {
			if (entry && entry.length > 0) {
				if (tabAddressGenerate[isMessage]) {
					let assetjson = JSON.parse(asset);

					const addressSKU = tabAddressGenerate["SKU"](PREFIX, assetjson.SKU);
					return state.getState([addressSKU]).then(entriesSKU => {
						const entrySKU = entriesSKU[addressSKU];
						if (entrySKU && entrySKU.length > 0) {
							const entrySKUDecoded = decode(entriesSKU[addressSKU]);
							let assetSKU = entrySKUDecoded.asset;
							let assetSKUjson = JSON.parse(assetSKU);

							if (
								assetSKUjson.Manufacturer &&
								assetSKUjson.Manufacturer != assetjson.Manufacturer
							) {
								throw new InvalidTransaction(
									"Same SKU already exists with diff. Manufacturer!!!"
								);
							}
						}

						const assetAddress = tabAddressGenerate["listedItems"](
							PREFIX,
							assetjson.SKU,
							owner
						);
						const assetAddressMfgSKU = tabAddressGenerate["listedItemsMfg"](
							PREFIX,
							assetjson.Manufacturer,
							assetjson.SKU
						);
						const assetAddressMfg = tabAddressGenerate["Mfg"](
							PREFIX,
							assetjson.Manufacturer
						);
						const assetAddressSKU = tabAddressGenerate["SKU"](
							PREFIX,
							assetjson.SKU
						);
						return state.setState({
							[assetAddress]: encode({
								asset,
								owner,
								isMessage: "listedItems",
								time
							}),
							[assetAddressMfgSKU]: encode({
								asset,
								owner,
								isMessage: "listedItemsMfg",
								time
							}),
							[assetAddressMfg]: encode({
								asset,
								owner,
								isMessage: "Mfg",
								time
							}),
							[assetAddressSKU]: encode({
								asset,
								owner,
								isMessage: "SKU",
								time
							})
						});
					});
				} else {
					throw new InvalidTransaction("Invalid method found");
				}
			} else {
				throw new InvalidTransaction(
					"Attempt to transact directly without creating user"
				);
			}
		}
	});
};

// Handler for vendor record data payloads
class vendorRecordHandler extends TransactionHandler {
	constructor() {
		console.log("Initializing Vendor record handler for", FAMILY_VENDOR);
		super(FAMILY_VENDOR, [VERSION], [PREFIX]);
	}

	apply(txn, state) {
		// Parse the transaction header and payload
		//const header = TransactionHeader.decode(txn.header);
		const signer = txn.header.signerPublicKey;

		const {
			action,
			asset,
			owner,
			isMessage,
			bothUserKeys,
			msgDecryptKey,
			time
		} = JSON.parse(txn.payload);

		const txnModel = new Transaction({
			action,
			asset,
			owner,
			isMessage,
			bothUserKeys,
			msgDecryptKey,
			time
		});
		console.info("Attempting to apply txn", txnModel);

		if (action === "create") {
			return createAsset(txnModel, state);
		} else {
			return Promise.resolve().then(() => {
				throw new InvalidTransaction("Invalid method found");
			});
		}
	}
}

module.exports = {
	vendorRecordHandler
};
