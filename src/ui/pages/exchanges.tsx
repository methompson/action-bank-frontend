import { Component } from 'react';
import { connect } from 'react-redux';

import { StoreType } from 'store/store';
import {
  actions,
  selectors,
} from 'store';

import { MessageCreationRequest } from 'store/messaging/messaging';

import { Exchange } from 'store/action-bank/action-bank-types';

import ExchangeCard from 'ui/components/exchangeCard';
import ModalContainer from 'ui/components/modalContainer';
import WithdrawalsModal from 'ui/components/withdrawalsModal';
import DepositsModal from 'ui/components/depositsModal';
import AddActionModal from 'ui/components/addActionModal';

interface ExchangesClassPropsType {
  loggedIn: boolean,
  exchanges: Exchange[],
  lastExchangeQuery: number,
  getAllExchanges: () => void,
  addInfoMessage: (req: MessageCreationRequest) => void,
}

enum ModalType {
  None,
  AddAction,
  Deposits,
  Withdrawals,
}

interface ExchangesClassStateType {
  modal: ModalType,
  modalExchange: Exchange | null,
}

class ExchangesClass extends Component<ExchangesClassPropsType, ExchangesClassStateType> {
  constructor(props: ExchangesClassPropsType) {
    super(props);

    this.state = {
      modal: ModalType.None,
      modalExchange: null,
    };
  }

  checkExchanges = () => {
    this.props.getAllExchanges();
  };

  refreshExchanges = () => {
    this.props.addInfoMessage({
      message: 'Refreshing Exchanges',
    });

    this.checkExchanges();
  };

  componentDidMount = () => {
    if (this.props.lastExchangeQuery < 0) {
      this.checkExchanges();
    }
  };

  changeModalType = (type: ModalType, ex: Exchange | null) => {
    this.setState({
      modal: type,
      modalExchange: ex,
    });
  };

  closeModal = () => {
    this.changeModalType(ModalType.None, null);
  };

  showAddAction = (ex: Exchange) => {
    this.changeModalType(ModalType.AddAction, ex);
  };

  showDeposit = (ex: Exchange) => {
    this.changeModalType(ModalType.Deposits, ex);
  };

  showWithdrawal = (ex: Exchange) => {
    this.changeModalType(ModalType.Withdrawals, ex);
  };

  render() {
    const e = this.props.exchanges;

    const components = Object.values(e).map((ex) => {
      return <ExchangeCard
        exchange={ex}
        openDeposit={this.showDeposit}
        openWithdrawal={this.showWithdrawal}
        openAddAction={this.showAddAction}
        key={`exchangeTitle_${ex.id}`} />;
    });

    let modal = null;

    const modalExchange = this.state.modalExchange;

    if (modalExchange !== null) {
      switch(this.state.modal) {
        case ModalType.AddAction:
          modal = <AddActionModal
            exchange={modalExchange}
            closeModal={this.closeModal} />;
          break;
        case ModalType.Deposits:
          modal = <DepositsModal
            exchange={modalExchange}
            closeModal={this.closeModal} />;
          break;
        case ModalType.Withdrawals:
          modal = <WithdrawalsModal
            exchange={modalExchange}
            closeModal={this.closeModal} />;
          break;
      }
    }

    let modalContainer = null;
    if (modal !== null) {
      modalContainer = (
        <ModalContainer
          close={this.closeModal}>
          {modal}
        </ModalContainer>);
    }

    return (
      <div className='container content section'>
        {modalContainer}
        <h1 style={{display: 'inline-block'}}>Exchanges</h1>
        <button className={'button'} onClick={this.refreshExchanges}>
          <span className='icon'>
            <i className="fas fa-sync-alt"></i>
          </span>
        </button>
        <div className='block columns is-mobile is-centered is-multiline'>
          {components}
        </div>
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
  addInfoMessage: actions.addInfoMessage,
};

const ConnectedExchanges = connect(mapStateToProps, mapDispatchToProps)(ExchangesClass);

export default function Exchanges() {
  return (
    <ConnectedExchanges />
  );
};