import { Exchange } from 'store/action-bank/action-bank-types';

interface ExchangeCardButtonProps {
  title: string,
  action: (ex: Exchange) => void,
  exchange: Exchange,
}

function ExchangeCardButton(props: ExchangeCardButtonProps) {
  return (
    <div
      className='card-footer-item button is-primary is-light'
      onClick={() => props.action(props.exchange)}>
      {props.title}
    </div>);
}

interface ExchangeCardProps {
  exchange: Exchange,
  openDeposit: (ex: Exchange) => void,
  openWithdrawal: (ex: Exchange) => void,
  openAddAction: (ex: Exchange) => void,
}

function ExchangeCard(props: ExchangeCardProps) {
  const subtitle = props.exchange.description.length > 0
    ? <p className='subtitle is-5'>{props.exchange.description}</p>
    : null;

  return (
    <div className='exchange-card column is-full-mobile is-half-tablet is-one-third-desktop is-one-quarter-fullhd'>
      <div className='card'>
        <header className='card-header'>
          <div className='card-header-title exchange-title'>
            <p className='title is-3'>
              {props.exchange.name}
            </p>
            {subtitle}
          </div>
        </header>
        <div className='card-content'>
          <div className='content'>
            <div className='larger'>
              {props.exchange.totalCurrency.toFixed(2)} Available
            </div>
            <div className=''>
              {props.exchange.depositCount} Deposit(s)
            </div>
            <div className=''>
              {props.exchange.withdrawalCount} Withdrawal(s)
            </div>
            <div className=''>
              {props.exchange.depositActions.length} Deposit Action(s)
            </div>
            <div className=''>
              {props.exchange.withdrawalActions.length} Withdrawal Action(s)
            </div>
          </div>
        </div>
        <footer className='card-footer'>
          <ExchangeCardButton title={'Deposit'} action={props.openDeposit} exchange={props.exchange} />
          <ExchangeCardButton title={'Withdrawal'} action={props.openWithdrawal} exchange={props.exchange} />
          <ExchangeCardButton title={'Actions'} action={props.openAddAction} exchange={props.exchange} />
        </footer>
      </div>
    </div>
  );
}

export default ExchangeCard;