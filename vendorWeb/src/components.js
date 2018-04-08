'use strict';

const $ = require('jquery');

const { VENDOR_PORTAL_URL, CUSTOMER_PORTAL_URL } = require('./../../config');

const addLoader = ($this, msg) => {
  const msgHtml = msg ? '<p>' + msg + '</p>' : '';
  $this.append(
    '<div class="loader-block loader-with-bg">' + msgHtml + '</div>'
  );
  $this.attr('disabled', 'disabled');
};

const removeLoader = $this => {
  $this.removeAttr('disabled');
  $this.find('.loader-block').remove();
};

const getHeaderHtml = () => {
  return '<div class="fixed">\n\
		<header>\n\
			<div class="header-content flex-container flex-container--spacebetween header-right-div">\n\
				<div class="menu hide-on-desktops">\n\
					<img src="../images/menu.svg" alt="menu icon">\n\
				</div>\n\
				<img src="../images/logo.webp" class="logo left" alt="vanig.io logo">\n\
				<div class="flex-container header-actions hide-on-phones">\n\
					<a id="logout" class="logout" href="javascript:void(0);">Logout</a>\n\
				</div>\n\
			</div>\n\
		</header>\n\
		<section class="navigation">\n\
			<div id="home-tabs" class="main-content flex-container">\n\
      <a data-toggle="items-listed" class="active nav-li vendor-only" href="javascript:void(0);">Items Listed</a>\n\
      <a data-toggle="add-new-item" class="nav-li vendor-only" href="javascript:void(0);">Add New Item</a>\n\
		</div>\n\
	</section>\n\
</div>';
};

const getMainTabsHtml = () => {
  return '<div class="tab-content main-content">\n\
  	<section class="data-items">\n\
    <div id="items-listed" class="tab-div vendor-only">\n\
      <div id="items-listed-edit" class="hide"></div>\n\
      <div id="items-listed-final"></div>\n\
    </div>\n\
    <div id="add-new-item" class="tab-div vendor-only">\n\
      <div id="add-new-item-edit" class="hide"></div>\n\
      <div id="add-new-item-final"></div>\n\
    </div>\n\
  	<div class="form-actions flex-container flex-container--spacebetween">\n\
  		<a id="cancel-task" class="next-btn hide" href="javascript:void(0);">Cancel</a>\n\
  		<button class="next-btn hide pos-relative" id="next">Next</button>\n\
  		<button class="next-btn hide pos-relative" id="edit-done">Save</button>\n\
  	</div>\n\
  </section>\n\
  </div>';
};

const addUserHeaderDiv = (imageurl, name) => {
  var url = imageurl ? imageurl : '../images/user-photo.png';

  var html =
    '<section class="row-user hide-on-phones">\n\
  <div class="main-content flex-container flex-container--spacebetween">\n\
  <div class="user">\n\
  <div class="user--photo">\n\
  <img width="60" height="60" class="user-photo" alt="user photo" src="' +
    url +
    '">\n\
  </div>\n\
  <h1 id="user-full-name" class="user--name">' +
    name +
    '</h1>\n\
  </div>\n\
  <a href="javascript:void(0);"><button class="add-new-item" class="right">Add new Item</button></a>\n\
  </div>\n\
  </section>';

  $('header').after(html);
};

const addEditIconForMobile = () => {
  var html =
    '<a class="add-new-item hide-on-desktops icon-edit">\n\
  <img src="../images/add-list.png" alt="Add item icon">\n\
  </a>';
  $('.tab-content').append(html);
};

const getListedItemsHtml = (parent, asset) => {
  var html =
    '<div id="showData">\
  <table>\
  <tbody>\
  <tr>\
  <th>\
  SKU\
  </th>\
  <th>\
  ItemNo\
  </th>\
  <th>\
  Description\
  </th>\
  <th>\
  Color\
  </th>\
  <th>\
  Size\
  </th>\
  <th>\
  Price\
  </th>\
  <th>\
  Manufacturer\
  </th>\
  <th>\
  MfgDate\
  </th>\
  <th>\
  MfgLocation\
  </th>\
  <th>\
  ExpiryDate\
  </th>\
  <th>\
  CurrentLocation\
  </th>\
  <th>\
  MadeOf\
  </th>\
  </tr>';

  var htmlTableData = '';
  console.log(asset);
  asset.forEach(item => {
    htmlTableData += '<tr>\
<th>';

    htmlTableData += item.SKU;
    htmlTableData += '</th>\
<th>';
    htmlTableData += item.ItemNo;
    htmlTableData += '</th>\
<th>';
    htmlTableData += item.Description;
    htmlTableData += '</th>\
<th>';
    htmlTableData += item.Color;
    htmlTableData += '</th>\
<th>';
    htmlTableData += item.Size;
    htmlTableData += '</th>\
<th>';
    htmlTableData += item.Price;
    htmlTableData += '</th>\
<th>';
    htmlTableData += item.Manufacturer;
    htmlTableData += '</th>\
<th>';
    htmlTableData += item.MfgDate;
    htmlTableData += '</th>\
<th>';
    htmlTableData += item.MfgLocation;
    htmlTableData += '</th>\
<th>';
    htmlTableData += item.ExpiryDate;
    htmlTableData += '</th>\
<th>';
    htmlTableData += item.CurrentLocation;
    htmlTableData += '</th>\
<th>';
    htmlTableData += item.MadeOf;
    htmlTableData += '</th>\
</tr>';
  });
  $(parent).html(html + htmlTableData);
};
const addNewItemDiv = (parent, asset) => {
  var sku = '',
    itemNumber = '',
    description = '',
    color = '',
    size = '',
    price = '',
    manufacturer = '',
    manufactureredDate = '',
    manufactureredLocation = '',
    expiry = '',
    currentLocation = '',
    madeof = '';
  if (asset) {
    sku = asset.sku;
    itemNumber = asset.itemNumber;
    description = asset.description;
    color = asset.color;
    size = asset.size;
    price = asset.price;
    manufacturer = asset.manufacturer;
    manufactureredDate = asset.manufactureredDate;
    manufactureredLocation = asset.manufactureredLocation;
    expiry = asset.expiry;
    currentLocation = asset.currentLocation;
    madeof = asset.madeof;
  }

  var html =
    '	<form name="additem" id="frmadditem" >\
    	<ul class="frmcls">\
<li><label>Item <span class="required">*</span></label>\
			<input type="text" name="SKU" id="SKU" class="field-divided" placeholder="SKU" />\
			<input type="text" name="ItemNo" id="ItemNo" class="field-divided" placeholder="Item Number" />\
		</li>\
		<li>\
			<label>Item Description <span class="required">*</span></label>\
			<input type="text" name="Description" id="Description" class="field-long" />\
		</li>\
		<li>\
			<label>Color</label>\
			<select name="Color" id="Color" class="field-select">\
			<option value="White">White</option>\
			<option value="Red">Red</option>\
			<option value="Blue">Blue</option>\
			<option value="Yellow">Yellow</option>\
			<option value="Green">Green</option>\
			<option value="Pink">Pink</option>\
			<option value="Purple">Purple</option>\
			<option value="Orange">Orange</option>\
			<option value="Brown">Brown</option>\
			<option value="Gray">Gray</option>\
			</select>\
		</li>\
		<li>\
			<label>Size</label>\
			<select name="Size" id="Size" class="field-select">\
				<option value="Large">Large</option>\
				<option value="Medium">Medium</option>\
				<option value="Small">Small</option>\
			</select>\
		</li>\
		<li>\
			<label>Price (VANIG Tokens)<span class="required">*</span></label>\
			<input type="text" id="Price" name="Price" class="field-long"  />\
		</li>\
		<li>\
			<label>Manufacturer Name<span class="required">*</span></label>\
			<input type="text" id="Manufacturer" name="Manufacturer" class="field-long" />\
		</li>\
		<li>\
			<label>Manufactured Info </label>\
			<input type="text" id="MfgDate" name="MfgDate" class="field-divided" placeholder="Manufactured Date" />\
			<input type="text" id="MfgLocation" name="MfgLocation" class="field-divided" placeholder="Manufactured Location" />\
		</li>\
		<li>\
			<label>Expiry Date</label>\
			<input type="text" id="ExpiryDate" name="ExpiryDate" class="field-long" />\
		</li>\
		<li>\
			<label>Current Location</label>\
			<input type="text" id="CurrentLocation" name="CurrentLocation" class="field-long" />\
		</li>\
		<li>\
			<label>Made of</label>\
			<input type="text" id="MadeOf" name="MadeOf" class="field-long" />\
		</li>\
	</ul>\
  <form>';
  $(parent).html(html);
};

module.exports = {
  addLoader,
  removeLoader,
  getHeaderHtml,
  getMainTabsHtml,
  addUserHeaderDiv,
  addEditIconForMobile,
  getListedItemsHtml,
  addNewItemDiv
};
