// This project uses the Module Pattern

import { DataCtrl } from './Data.mjs';
import { AcctUICtrl } from './UI.mjs';

// Basic Structure
// Start with an IIFY - immediately invoked function expression
// (function () {
//   // Declare private variables and functions
//
//   return {
//     // Declare public variables and functions
//   }
// })();

// :: CONTROLLERS ::
// Storage CONTROLLER :: const StorageCtrl
  // Public Methods
  // // flush, storeItem, getItemsFromStorage, updateItemStorage
// Item CONTROLLER :: const DataCtrl
  // Public Methods
  // // getItems, addItem, getItemById, updateItem, deleteItem,
  // // clearAllItems, setCurrentItem, getCurrentItem, getTotalCents
// UI CONTROLLER :: const UICtrl
  // Public Methods
  // // populateTrList, getItemInput, addTrItem, deleteTrItem,
  // // updateTrItem, clearInput, putCurrentItemToForm, emptyTableBody,
  // // showTotalAmount, editStateAddCash, editStateModCash, getSelectors
// App CONTROLLER :: const App = (function(DataCtrl, StorageCtrl, UICtrl) {
  // Public Methods
  // // init

// App CONTROLLER //
const App = (function(DataCtrl, AcctUICtrl) {
  let CashComp;
  const loadEventListeners = function() {
    const UIIds = CashComp.getSelectors();
    document.addEventListener('keypress', function(e) {
      if (e.keyCode === 13 || e.which === 13) {
        e.preventDefault();
        return false;
      }
    });
    document.querySelector(UIIds.addBtn).addEventListener(
      'click', addBtnClick);
    document.querySelector(UIIds.addTrBtn).addEventListener(
      'click', addTrBtnClick);
    document.querySelector(UIIds.backBtn).addEventListener(
      'click', backBtnClick);
    document.querySelector(UIIds.clearBtn).addEventListener(
      'click', clearAllItemsBtnClick);
    document.querySelector(UIIds.deleteBtn).addEventListener(
      'click', deleteBtnClick);
    document.querySelector(UIIds.trList).addEventListener(
      'click', editTrBtnClick);
    document.querySelector(UIIds.updateBtn).addEventListener(
      'click', updateBtnClick);
    document.querySelector(UIIds.locationSelect).addEventListener(
      'change', locationSelectChange);
    $(UIIds.cashAssessmentModal).on('show.bs.modal', function (e) {
      let amt;
      amt = parseInt(DataCtrl.getItemByName('Config',
        'cash-onhand-need').obj.pennies / 100);
      document.querySelector(UIIds.modalNeed).value = amt;
      amt = parseInt(DataCtrl.getItemByName('Config',
        'cash-onhand-okay').obj.pennies / 100);
      document.querySelector(UIIds.modalOkay).value = amt;
    });
    $(UIIds.cashAssessmentModal).on('hide.bs.modal', function (e) {
      let param, itemToEdit, amtNeed, amtOkay;
      const dataStore = 'Config';

      amtNeed = document.querySelector(UIIds.modalNeed).value;
      if (parseInt(amtNeed) < 0) {
        const modalAlert = document.querySelector(UIIds.ModalAlert);
        modalAlert.classList = "alert alert-dismissible alert-danger";
        modalAlert.innerHTML = `<button type="button" class="close" data-dismiss="alert">&times;</button>The minimum needed [<strong>$${amtNeed}</strong>] must be greater or equal to than zero.`;
        e.preventDefault();
        return;
      }
      param = 'cash-onhand-need';
      itemToEdit = DataCtrl.getItemByName(dataStore, param);
      DataCtrl.setCurrentItem(dataStore, itemToEdit);
      DataCtrl.updateItem(dataStore, param, { pennies: parseInt(amtNeed + '00') } );

      amtOkay = document.querySelector(UIIds.modalOkay).value;
      if (parseInt(amtOkay) < parseInt(amtNeed)) {
        const modalAlert = document.querySelector(UIIds.modalAlert);
        modalAlert.classList = "alert alert-dismissible alert-danger";
        modalAlert.innerHTML = `<button type="button" class="close" data-dismiss="alert">&times;</button>The minimum okay [<strong>$${amtOkay}</strong>] must be greater or equal to than the minimum needed [<strong>$${amtNeed}</strong>].`;
        e.preventDefault();
        return;
      }
      param = 'cash-onhand-okay';
      itemToEdit = DataCtrl.getItemByName(dataStore, param);
      DataCtrl.setCurrentItem(dataStore, itemToEdit);
      DataCtrl.updateItem(dataStore, param, { pennies: parseInt(amtOkay + '00') } );

      CashComp.showTotalAmount(
        DataCtrl.getTotalCents('Cash'),
        DataCtrl.getItemByName('Config', 'cash-onhand-need').obj.pennies,
        DataCtrl.getItemByName('Config', 'cash-onhand-okay').obj.pennies);
    });
    $(UIIds.cashModalAlert).on('close.bs.alert', function (e) {
      const modalAlert = document.querySelector(UIIds.modalAlert);
      modalAlert.classList = "";
      modalAlert.innerHTML = "";
      e.preventDefault();
    });
  };

  const addBtnClick = function(e) {
    const { name, pennies } = CashComp.getItemInput();
    if (name !== '' && pennies !== '') {
      const newItem =
        DataCtrl.addItem('Cash', name, { pennies } );
      CashComp.addTrItem(newItem);
      CashComp.populateTrList(DataCtrl.getItems('Cash'));
      CashComp.showTotalAmount(
        DataCtrl.getTotalCents('Cash'),
        DataCtrl.getItemByName('Config', 'cash-onhand-need').obj.pennies,
        DataCtrl.getItemByName('Config', 'cash-onhand-okay').obj.pennies);
      setAppState("hide-cash-editor");
    }
    e.preventDefault();
  };

  const addTrBtnClick = function(e) {
    setAppState("display-new-cash-editor");
  };

  const backBtnClick = function(e) {
    setAppState("hide-cash-editor");
  };

  const deleteBtnClick = function(e) {
    const currentItem = DataCtrl.getCurrentItem('Cash');
    DataCtrl.deleteItem('Cash', currentItem.id);
    CashComp.deleteTrItem(currentItem.id);
    CashComp.populateTrList(DataCtrl.getItems('Cash'));
    CashComp.showTotalAmount(
      DataCtrl.getTotalCents('Cash'),
      DataCtrl.getItemByName('Config', 'cash-onhand-need').obj.pennies,
      DataCtrl.getItemByName('Config', 'cash-onhand-okay').obj.pennies);
    setAppState("hide-cash-editor");
    e.preventDefault();
  };

  const updateBtnClick = function(e) {
    const { name, pennies } = CashComp.getItemInput();
    const updatedItem = DataCtrl.updateItem('Cash', name, { pennies });
    CashComp.updateTrItem(updatedItem);
    CashComp.showTotalAmount(
      DataCtrl.getTotalCents('Cash'),
      DataCtrl.getItemByName('Config', 'cash-onhand-need').obj.pennies,
      DataCtrl.getItemByName('Config', 'cash-onhand-okay').obj.pennies);
    setAppState("hide-cash-editor");
    e.preventDefault();
  };

  const editTrBtnClick = function(e) {
    if (e.target.classList.contains('edit-item')) {
      const listId = e.target.parentNode.parentNode.parentNode.id;
      const listIdArr = listId.split('-');
      const id = parseInt(listIdArr[1]);
      const itemToEdit = DataCtrl.getItemById('Cash', id);
      DataCtrl.setCurrentItem('Cash', itemToEdit);
      CashComp.putItemToForm(itemToEdit);
      setAppState("display-mod-cash-editor");
    }
    e.preventDefault();
  };

  const clearAllItemsBtnClick = function() {
    DataCtrl.clearAllItems('Cash');
    CashComp.showTotalAmount(
      DataCtrl.getTotalCents('Cash'),
      DataCtrl.getItemByName('Config', 'cash-onhand-need').obj.pennies,
      DataCtrl.getItemByName('Config', 'cash-onhand-okay').obj.pennies);
    CashComp.emptyTableBody();
    setAppState("display-new-cash-editor");
  };

  const locationSelectChange = function() {
    document.querySelector('#cash-name').value =
    document.querySelector('#cash-location-select').value;
  };

  const setAppState = function(state) {
    switch (state) {
      case "hide-cash-editor":
        CashComp.editStateOff();
        DataCtrl.setCurrentItem('Cash', null);
        break;
      case "display-new-cash-editor":
        CashComp.editStateAddCash();
        break;
      case "display-mod-cash-editor":
        CashComp.editStateModCash();
        break;
    }
  };

  const initConfig = function() {
    DataCtrl.addItem('Config', 'cash-onhand-need', { pennies: 1000 });
    DataCtrl.addItem('Config', 'cash-onhand-okay', { pennies: 2500 });
  };

  // App Public Methods
  // // init
  return {
    init: function() {
      let config;
      config = DataCtrl.getItems('Config');
      if (config.length === 0) {
        initConfig();
        config = DataCtrl.getItems('Config');
      }
      const items = DataCtrl.getItems('Cash');
      CashComp = new AcctUICtrl('cash');
//      CashComp = CashComp.AcctUICtrl;
      if (items.length === 0) {
        setAppState("display-new-cash-editor");
      } else {
        CashComp.populateTrList(items);
        setAppState("hide-cash-editor");
      }
      CashComp.showTotalAmount(
        DataCtrl.getTotalCents('Cash'),
        DataCtrl.getItemByName('Config', 'cash-onhand-need').obj.pennies,
        DataCtrl.getItemByName('Config', 'cash-onhand-okay').obj.pennies);
      loadEventListeners();
    }
  }
})(DataCtrl, AcctUICtrl);

// :: BEGIN EXECUTION ::
App.init();