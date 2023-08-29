/* eslint-disable react/jsx-no-comment-textnodes */
import React, { Component } from "react";
import { connectToStores } from "tools/reflux-tools";
import Reports from "components/reports";
import T from "components/i18n";
import OpenModalButton from "components/modal/open-modal-button";
import ReportsRow from "./reports-row";
import ExpensesStore from "./expenses-store";
import Actions from "./expenses-actions";
import Box from "react-bulma-components/lib/components/box";
import Heading from "react-bulma-components/lib/components/heading";
import ExpensesFilter from "./expenses-filter";
import ExpensesTotal from "./expenses-total";

import { redirectTo } from "tools/redirect-to";
import User from "user/user-store";

import { isMobile } from "react-device-detect";

const COLUMNS = [
  "reports-date",
  "reports-category",
  "reports-name",
  "reports-type",
  "reports-amount",
  "reports-balance",
  "reports-account",
  "reports-actions",
]; //тут ми маємо список колонок

class Expenses extends Component {
  state = {
    rows: null, //створюємо початковий стан колонок,ставимо null,щоб потім змінити дані того стану
  };

  // constructor() {
  //     // this.addExpenses = this.addExpenses.bind(this);
  // }

  componentDidMount() {
    Actions.loadCategory();
    Actions.load(); //компонент вмонтований в DOM і після цього виконуються дії із Actions:завантаження списку категорій і завантаження якихось ще даних
  }

  emptyMessage() {
    // функція для повідомлення,коли список витрат порожній ,і тоді можна натиснути на кнопку і відкрити модальне вікно,щоб додати витрати
    return (
      <Box align="center">
        <Heading>{T("not-have-expenses")}</Heading>
        <OpenModalButton
          link="/expenses/add-expenses"
          text={T("add-expenses-btn")}
        />
      </Box>
    );
  }

  // componentWillReceiveProps(nprops) {
  //     const cfilter = this.props.filter;
  //     const nfilter = nprops.filter;

  //     if (cfilter.date !== nfilter.date || cfilter.slice !== nfilter.slice) {
  //         Sport.Actions.load(nfilter);
  //     }

  //     if (cfilter.status !== nfilter.status) {
  //         Sport.Actions.filter(nfilter);
  //     }
  // }

  renderTopDesktop() {
    //цей метод відображає компоненти на верхній частині екрану різних розмірів     //компонента, який фільтрує витрати  і компонента,який підсумовує витрати на основі даних, отриманих з ExpensesStore.getExpenses().
    return (
      <>
        <ExpensesFilter />
        <ExpensesTotal sales={ExpensesStore.getExpenses()} />
      </>
    );
  }

  renderTopMobile() {
    //цей метод відображає компоненти на верхній частині екрану малих розмірів (мобільних пристроїв)
    return (
      <>
        <ExpensesTotal sales={ExpensesStore.getExpenses()} />
        <ExpensesFilter />
      </>
    );
  }

  renderView() {
    //відображає вміст компонента
    const props = this.props, //  констант props приймає значення пропсів компонента
      emptyMessage = this.emptyMessage,
      size_button = isMobile ? "small" : "medium"; //якщо екран малих розмірів,то розір малий,якщо ні,то середній розмір

    return (
      <div className="expenses-page">
        {isMobile ? this.renderTopMobile() : this.renderTopDesktop()}
        <Box>
          <div className="ex-open-modal-wrapper">
            <OpenModalButton
              size={size_button}
              link="/transactions/move-funds"
              text={T("move-funds-btn")}
              icon="exchange-alt"
            />
            {/*<OpenModalButton size={size_button} link="/expenses/add-plan-expenses" text={T('add-plan-expenses-btn')} />*/}
            <OpenModalButton
              size={size_button}
              link="/expenses/add-expenses"
              color="danger"
              text={T("add-expenses-btn")}
              icon="minus-circle"
            />
            <OpenModalButton
              size={size_button}
              link="/expenses/add-funds"
              color="success"
              text={T("add-funds-btn")}
              icon="plus-circle"
            />
          </div>
          <Reports
            {...props}
            load={Actions.load}
            emptyMessage={emptyMessage}
            columns={COLUMNS}
            hideFooterOnEmpty
            rows={ExpensesStore.getExpenses()}
          >
            <ReportsRow role="row" />
          </Reports>
        </Box>
      </div>
    );
  }
  //99 //тут ми викликаємо метод відповідно до розміру екрану 103
  //модальні вікна для додавання та переміщення витрат коштів
  //134       //відображає звіти і таблицю витрат.
  // 136           //відображає окремий рядок в таблиці звітів

  render() {
    return User.getModuleEnable("payments") //тут викликається функція getModuleEnable в User яка визначає чи доступні payments для цього юзера
      ? this.renderView()
      : redirectTo("/access-denied");
  }
  //якщо модуль доступний то викликається метод this.renderView(),якщо ні,то нас скеровує на сторінку з повідомленням ,що вімовлено в доступі
}

export default connectToStores(Expenses, { _: ExpensesStore }); //тут викликаємо ф-ю connectToStores, яка з'єднує компонент Expenses з магазином даних (ExpensesStore).{ _: ExpensesStore } - Це об'єкт, де ключ : це назва магазину, а значення ExpensesStore-конкретний магазин, з яким буде підключено компонент.
