import React, { Component } from "react";
import T from "components/i18n";
import Money from "components/money";
import WarehouseStore from "modules/warehouse/warehouse-store";
import ShipmentsStore from "modules/shipments/shipments-store";
import ProductsStore from "modules/products/products-store";
import ExpensesStore from "modules/expenses/expenses-store";
import Level from "react-bulma-components/lib/components/level";
import OpenModalButton from "components/modal/open-modal-button";
import Dropdown from "react-bulma-components/lib/components/dropdown";

import NumberBlock from "components/number-block";
import User from "user/user-store";
import formatDate from "tools/format-date";

// import Button from 'react-bulma-components/lib/components/button';
import DOM from "react-dom-factories";
import { confirmAlert } from "react-confirm-alert"; // Import
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Actions from "./shipments-actions";

import List from "react-bulma-components/lib/components/list";
import Columns from "react-bulma-components/lib/components/columns";
import Heading from "react-bulma-components/lib/components/heading";
import OpenInsideModal from "components/modal/open-inside-modal";
import AddExpensesModal from "modules/expenses/add-expenses-modal"; //Styled Components стилізація

import { isMobile } from "react-device-detect";

class ShipmentsRow extends Component {
  getPaymentButton(data, total_pay) {
    //ця функція приймає два аргументи: data і total_pay. Вона викликається з цими арг для генерації відображення кнопки оплати.
    return (
      <Columns key="payment-button" className={isMobile ? "is-mobile" : null}>
        <Columns.Column size="one-third">
          <OpenInsideModal
            size="small"
            className="margin-top-10"
            text={T(isMobile ? "pay-shipment-mobile-btn" : "pay-shipment-btn")}
          >
            <AddExpensesModal category_id={11} shipment_id={data["id"]} />
          </OpenInsideModal>
        </Columns.Column>
        <Columns.Column
          className={isMobile ? null : "margin-top-20"}
          align="right"
        >
          {total_pay > 0 ? (
            <b className="has-text-danger">
              {T("not-paid")}:{" "}
              <Money
                currency={data["currency"]}
                amount={total_pay}
                className="has-text-danger"
                wrapper={DOM.span}
              />
            </b>
          ) : null}
        </Columns.Column>
      </Columns>
    );
  }

  //38 компонент,який має окрему кол в середині котейнера <Columns>  і він займає одну третю котейнера. тут є 2 колонки//
  //43 компонент,що відкриває модальне вікно з внтр вмістом і змінюється тип кнопки відповідно до розміру екрану-використовується тернарний оператор
  //48 компонент,що має модальне вікно для додавання витрат, і він отримує два аргументи category_id і shipment_id.
  //47 тут є текст і сума платежу в цій другій колонці
  //51 total_pay > 0 використовуємо, щоб перевірити, чи є щось для оплати.
  //54 форматує суму грошей і показує її з валютою
  getDeliveryInfo(data) {
    //ф-я з одним арг data
    const is_delivery_pay = !!data["delivery_expenses_id"];
    // тут перевіряємо , чи існує значення delivery_expenses_id у даних data,якщо так, то is_delivery_pay буде true, Кщо ні,то false.

    if (is_delivery_pay) {
      const daid = data["delivery_expenses"]["account_id"];

      //дані доставки є в  data["delivery_expenses"]
      //конкретний обліковий запис для оплати є в -data["delivery_expenses"]["account_id"].
      //якщо is_delivery_pay є true,то виконується  код

      return (
        <div key={"k2"}>
          <b className="has-text-success">
            {" "}
            {T("delivery_paid")}:{" "}
            <Money
              aid={daid}
              amount={data["delivery_expenses"]["amount"]}
              className="has-text-success"
              wrapper={DOM.span}
            />{" "}
          </b>
          {" " + T("from_account")}{" "}
          <b>{T(ExpensesStore.getAccountName(daid))} </b>
          <br />
        </div>
      );
    }

    return "";
  }
  //81... тут є інформація про оплачену доставку
  //96   //getAccountName ф-я яка використовується для отримання імені облікового запису
  getPaymentInfo(data) {
    //ф-я яка приймає лиш 1 арг -data
    const is_pay = !!data["expenses_id"];
    //тут дивимося чи існує значення expenses_id в переданих даних data. Якщо так, то is_pay буде true, якщо ні- false.
    let response = [];
    if (is_pay) {
      response.push(
        <div key={"kp2"}>
          <b> {T("received_goods_worth")}:</b>{" "}
          <Money
            currency={data["currency"]}
            amount={data["received_amount"]}
            wrapper={DOM.span}
          />{" "}
        </div>
      );
      //111 тут якщо is_pay true  тоді ми бачимо інформацію про ці оплати
      let total_aid = 0,
        total_pay = 0;
      for (let i in data["expenses"]) {
        const expenses = data["expenses"][i];
        const aid = expenses["account_id"];
        total_aid = aid;
        total_pay += expenses["amount"];
        response.push(
          <div key={"k1-" + expenses["id"]}>
            <b className="has-text-success">
              {" "}
              {T("paid")}:{" "}
              <Money
                aid={aid}
                amount={expenses["amount"]}
                className="has-text-success font-size-120"
                wrapper={DOM.span}
              />
            </b>
            {" " + T("from_account")}{" "}
            <b>{T(ExpensesStore.getAccountName(aid))}</b>
            <br />
          </div>
        );
      }

      if (data["expenses"].length > 1) {
        response.push(
          <div key={"total-" + data["expenses_id"]}>
            <b className="has-text-success">
              {" "}
              {T("total")}:{" "}
              <Money
                aid={total_aid}
                amount={total_pay}
                className="has-text-success font-size-120"
                wrapper={DOM.span}
              />
            </b>
          </div>
        );
      }
      ///149 Якщо is_pay є true, але немає оплати, то відображається інформація про отриману суму товарів та можливість оплати доставки.

      response.push(this.getDeliveryInfo(data));
      //Якщо не було оплат чи товарів, тоді генерується відображення очікуваної суми товарів.

      if (total_pay < data["received_amount"]) {
        response.push(
          this.getPaymentButton(data, data["received_amount"] - total_pay)
        );
      }
    } else if (data["shipment_status"] === "complete") {
      response.push(
        <div key={"k1"}>
          <b>{T("received_goods_worth")}:</b>{" "}
          <Money amount={data["received_amount"]} wrapper={DOM.span} /> <br />
          <b>{T("shipment-not-paid-status")}</b>
          <br />
        </div>
      );

      response.push(this.getDeliveryInfo(data));
      response.push(this.getPaymentButton(data, 0));
    } else {
      response.push(
        <div key="k2">
          <b> {T("expected_goods_worth")}:</b>{" "}
          <Money
            amount={data["amount"]}
            currency={data["currency"]}
            wrapper={DOM.span}
          />
        </div>
      );
    }
    return <div>{response}</div>; //повертається масив з інформацією про доставку іоплату
  }

  desktopRender() {
    const { data } = this.props; // деструктуризується об'єкт props компонента,і витягається властивість data.
    let comment = "";

    if (data["comment"] && data["comment"] !== "") {
      comment = (
        <>
          {" "}
          <b>{T("shipments-comment")}:</b> {data["comment"]}{" "}
        </>
      );
    }
    //тут буде міститися кометра,якщо він є в data

    let classname = "is-size-7";

    if (data["shipment_status"] === "saled") {
      classname += " opacity05";
    }
    // тут регулюєтья стиль відповідно до статусу доставки

    //227 інформація про замовлення: id і звідки
    //239  про дати та місце доставки
    /// 248 інформації про валюту та обмінний курс якщо є різні валюти
    //257 коментар
    //260 різні кнопки- в процесі(pending)та виконано, друк,редагування
    //293 -статус сдоставки
    return (
      <tr className={classname}>
        <td align="left" width="30%">
          ID: {data["id"]}. {data["name"]}{" "}
          {data["supplier_id"]
            ? "(" +
              T("from") +
              " " +
              T(ShipmentsStore.getSupplierName(data["supplier_id"])) +
              ")"
            : ""}
          <br />
          <b>{T("shipments-created_at")}:</b> {formatDate(data["created_at"])}{" "}
          <br />
          <b>{T("delivery-delivery")}:</b>{" "}
          {data["delivered_date"]
            ? formatDate(data["delivered_date"])
            : T("supply")}{" "}
          <br />
          <b>{T("on-warehouse")}:</b>{" "}
          {T(WarehouseStore.getWarehouseName(data["marketplace_id"]))} <br />
          {ExpensesStore.hasManyCurrencies() &&
          parseInt(data["currency"]) !== parseInt(User.get("currency_id")) ? (
            <span>
              <b>{T("shipment-currency")}:</b>{" "}
              {User.getCurrency(data["currency"])} <br />
              <b>{T("exchange-rate")}:</b>{" "}
              <Money amount={data["currency_rate"]} wrapper={DOM.span} />
              <br />
            </span>
          ) : null}
          {comment}
          <Level className="margin-top-5">
            <Level.Side align="left">
              {/*<Level.Item>
                            <OpenModalButton size="small" link={{
                              pathname: '/shipments/edit-shipment',
                              state: {'edit': true, 'step': 0, 'data': data }
                            }} text={T('btn-edit')} />
                          </Level.Item> */}
              {data["shipment_status"] === "pending"
                ? this.getPendingButton()
                : ""}
              {data["shipment_status"] === "complete"
                ? this.getCompeteButton()
                : ""}
              <Level.Item>{this.getPrintButton(data.id)}</Level.Item>
              <Level.Item>
                <Link
                  to={ProductsStore.getPrintTabLink(null, data.id)}
                  target="_blank"
                  title={T("print-tags")}
                >
                  <FontAwesomeIcon
                    icon="tags"
                    size="1x"
                    title={T("print-tags")}
                  />
                </Link>
              </Level.Item>
            </Level.Side>
          </Level>
        </td>
        <td> {T(data["shipment_status"])}</td>
        <td className="left">
          <b>
            {data["shipment_status"] === "complete"
              ? T("expected")
              : T("supply")}
            :
          </b>{" "}
          {data["expected_quantity"]} <br />
          <b>{T("received")}:</b> {data["quantity"]} <br />
          <span className="has-text-success">
            <b>{T("saled")}:</b> {data["sold"]} (
            {data["sold"] > 0
              ? Math.round((100 / data["quantity"]) * data["sold"])
              : 0}
            %) <br />
          </span>
        </td>
        <td className="left">
          {!User.getPermissionEnable("incomeinformation") ? null : (
            <>
              {this.getPaymentInfo(data)} <br />
            </>
          )}
        </td>
      </tr>
    );
  }

  //304тернарний оператор, який перевіряє, чи кількість проданих одиниць більше 0. Якщо так тоді виводиться відсоток продаж, який обчислюється як (продано / загальна кількість) * 100. Якщо ні, то виводиться 0%
  //313 ф-я яка виводить інформацію про оплати залежно від даних
  render() {
    return isMobile ? this.mobileRender() : this.desktopRender();
  }
}

export default ShipmentsRow;
