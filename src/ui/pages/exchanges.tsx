import { Component } from "react";
import { connect } from 'react-redux';

import { StoreType } from "store/store";
import {
  actions,
  selectors,
} from 'store';

import { Exchange } from 'store/action-bank/action-bank-types';

interface ExchangeCardButtonProps {
  title: string,
  action: () => void,
}

function ExchangeCardButton(props: ExchangeCardButtonProps) {
  return <div className='card-footer-item button is-primary is-light'>{props.title}</div>;
}

interface ExchangeTitleProp {
  exchange: Exchange,
}

function ExchangeCard(props: ExchangeTitleProp) {
  return (
    <div className="block">
      <div className="card">
        <header className="card-header">
          <p className="card-header-title">{props.exchange.name}</p>
        </header>
        <div className="card-content">
          <div className="content">
            <p className="">
              Withdrawal Actions: {props.exchange.withdrawalActions.length}
            </p>
            <p className="">
              Deposit Actions: {props.exchange.depositActions.length}
            </p>
            <hr />
            <p className="">
              Withdrawals: {props.exchange.withdrawals.length}
            </p>
            <p className="">
              Deposits: {props.exchange.deposits.length}
            </p>
          </div>
        </div>
        <footer className="card-footer">
          <ExchangeCardButton title={'Add New Action'} action={() => {}} />
          <ExchangeCardButton title={'Add Deposit'} action={() => {}} />
          <ExchangeCardButton title={'Add Withdrawal'} action={() => {}} />
        </footer>
      </div>
    </div>
  );
}

interface ExchangeClassPropsType {
  loggedIn: boolean,
  exchanges: Exchange[],
  lastExchangeQuery: number,
  getAllExchanges: () => void,
}

class ExchangesClass extends Component<ExchangeClassPropsType, unknown> {
  checkExchanges = () => {
    this.props.getAllExchanges();
  };

  componentDidMount = () => {
    if (this.props.lastExchangeQuery < 0) {
      this.checkExchanges();
    }
  };

  render() {
    const e = this.props.exchanges;
    console.log('Exchanges Class');

    const components = Object.values(e).map((ex) => {
      return <ExchangeCard exchange={ex} key={`exchangeTitle_${ex.id}`} />;
    });

    return (
      <div className="container content section">
        <h1>Exchanges</h1>
        {components}
      </div>
    );
  }
}

const mapStateToProps = (state: StoreType) => {
  return {
    loggedIn: selectors.isLoggedIn(state),
    exchanges: selectors.exchanges(state),
    lastExchangeQuery: selectors.lastExchangeQuery(state),
  };
};

const mapDispatchToProps = {
  getAllExchanges: actions.getAllExchanges,
};

const ConnectedExchanges = connect(mapStateToProps, mapDispatchToProps)(ExchangesClass);

export default function Exchanges() {
  return (
    <ConnectedExchanges />
  );
};