import { Component } from "react";
import { connect } from 'react-redux';

import { StoreType } from "store/store";
import {
  actions,
  selectors,
} from 'store';

import { Exchange } from 'store/action-bank/action-bank-types';

interface RXClassProps {
  loggedIn: boolean,
  exchanges: Exchange[],
  lastExchangeQuery: number,
  getAllExchanges: () => void,
}

interface RXClassState {}

type Timeout = ReturnType<typeof setTimeout>;

/**
 * Reactive class to perform actions when the Redux state changes.
 */
class RXClass extends Component<RXClassProps, RXClassState> {
  exchangeTimeout: Timeout | null = null;

  mounted = false;
  initialRun = false;

  constructor(props: RXClassProps) {
    super(props);

    console.log('Constructing RXClass');
  }

  checkExchanges = () => {
    console.log('checkExchanges called');
    this.props.getAllExchanges();
  };

  componentDidMount = () => {
    console.log('RX componentDidMount');
    this.mounted = true;
  };

  /**
   * The reactive function reacts to state changes. If the user logs in or out, we run
   * this series of functions to retrieve or clear data for the user.
   * @returns Promise<void>
   */
  rx = async () => {
    console.log('Reacting. Loaded? ', this.mounted);
    if (!this.mounted) return;

    if (!this.props.loggedIn && this.props.lastExchangeQuery >= 0) {
      console.log('Need to reset Exchanges');
    }

    if (this.props.loggedIn) {
      if (this.props.lastExchangeQuery < 0) {
        console.log('Getting Exchanges');
        this.checkExchanges();
      }
    }

    this.initialRun = true;
  };

  render() {
    console.log("Rendering RXClass", this.props);

    if (this.mounted) this.rx();

    return <div></div>;
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

const ConnectedRX = connect(mapStateToProps, mapDispatchToProps)(RXClass);

export default function RX() {
  console.log("Rendering RX");
  return (
    <ConnectedRX />
  );
};