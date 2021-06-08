import { useSelector, useDispatch } from 'react-redux';
import { actions, selectors } from 'store';

import { Exchange } from 'store/action-bank/action-bank-types';

interface DebugExchangeProps {
  exchange: Exchange,
}

function DebugExchangeComponent(props: DebugExchangeProps) {
  return (
    <div>
      <p>Exchange</p>
      <p>{props.exchange.id}: {props.exchange.name}</p>
    </div>
  );
}

interface DebugButtonProps {
  title: string,
  action: () => void,
}

function DebugButton(props:DebugButtonProps) {
  return (
    <div className='buttons'>
      <button className='button is-primary' onClick={ props.action }>
        {props.title}
      </button>
    </div>
  );
}

const Debug = () => {
  const dispatch = useDispatch();

  const addExchange = () => {
    dispatch(actions.addExchange({
      name: 'Test Client Exchange',
      description: 'Test Client Exchange Description'
    }));
  };

  const getExchanges = () => {
    dispatch(actions.getAllExchanges());
  };

  const exchanges = useSelector(selectors.exchanges);
  const exchangeComponents = Object.values(exchanges)
    .map((ex) => {
      return <DebugExchangeComponent exchange={ex} key={ex.id} />;
    });

  const messages = useSelector(selectors.messages);
  const messageComponents = Object.values(messages)
    .map((el) => {
      return (<div key={el.id}>
        <p>{el.id}</p>
        <p>{el.message}</p>
      </div>);
    });

  const sendMessage = () => {
    dispatch(actions.addInfoMessage({
      message: 'Test Info Message',
    }));
  };

  const setIsLoading = () => {
    dispatch(actions.setIsLoading());

    setTimeout(() => {
      dispatch(actions.setIsNotLoading());
    }, 1500);
  };

  return (
    <div className='content'>
      <DebugButton title='Add New Exchange' action={addExchange} />
      <DebugButton title='Get All Exchanges' action={getExchanges} />
      <DebugButton title='Send New Message' action={sendMessage} />
      <DebugButton title='Make Loading' action={setIsLoading} />
      <hr />

      {exchangeComponents}
      {messageComponents}
    </div>
  );
};

export default Debug;