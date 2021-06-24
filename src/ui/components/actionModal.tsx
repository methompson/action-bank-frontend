import { useState, FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { actions, selectors } from 'store';
import { DepositAction, Exchange, WithdrawalAction } from 'store/action-bank/action-bank-types';

import AddActionModal from 'ui/components/addActionModal';

interface ActionTableProps {
  exchange: Exchange,
}

const ActionTable: FunctionComponent<unknown> = (props) => {
  return (
    <table className='table is-narrow'>
      <thead>
        <tr>
          <th>Name</th>
          <th>UoM</th>
          <th>UoM #</th>
          <th>Trans #</th>
          <th></th>
        </tr>
      </thead>
      {props.children}
    </table>
  );
};

function DepositActionTable(props: ActionTableProps) {
  const dispatch = useDispatch();

  const deleteDepositAction = (action: DepositAction) => {
    console.log('Deleting Deposit Action', action.id);

    dispatch(actions.deleteDepositAction({depositAction: action}));
  };

  return (
    <div className='block'>
      <h5>Deposit Actions</h5>
      <ActionTable>
        <tbody>
          {
            props.exchange.depositActions.map((action) => {
              return (
                <tr key={action.id}>
                  <th>{action.name}</th>
                  <th>{action.uom}</th>
                  <th>{action.uomQuantity}</th>
                  <th>{action.depositQuantity}</th>
                  <th>
                    <button onClick={() => deleteDepositAction(action)} className='button is-danger is-small is-light'>
                      <i className='fas fa-trash-alt is-danger'></i>
                    </button>
                  </th>
                </tr>
              );
            })
          }
        </tbody>
      </ActionTable>
    </div>
  );
}

function WithdrawalActionTable(props: ActionTableProps) {
  const dispatch = useDispatch();

  const deleteWithdrawalAction = (action: WithdrawalAction) => {
    console.log('Deleting Withdrawal Action', action.id);

    dispatch(actions.deleteWithdrawalAction({withdrawalAction: action}));
  };

  return (
    <div className='block'>
      <h5>Withdrawal Actions</h5>
      <ActionTable>
        <tbody>
          {
            props.exchange.withdrawalActions.map((action) => {
              return (
                <tr key={action.id}>
                  <th>{action.name}</th>
                  <th>{action.uom}</th>
                  <th>{action.uomQuantity}</th>
                  <th>{action.withdrawalQuantity}</th>
                  <th>
                    <button onClick={() => deleteWithdrawalAction(action)} className='button is-danger is-small is-light'>
                      <i className='fas fa-trash-alt'></i>
                    </button>
                  </th>
                </tr>
              );
            })
          }
        </tbody>
      </ActionTable>
    </div>
  );
}

interface ActionModalProps {
  exchangeId: string,
  closeModal: () => void,
}

export default function ActionModal(props: ActionModalProps) {
  const exchange = useSelector(selectors.getExchangeById(props.exchangeId));
  const [showAddAction, setShowAddAction] = useState(false);

  if (exchange == null) {
    return (
      <div>
        <h3>Invalid Exchange</h3>
      </div>
    );
  }

  const addAction = showAddAction
    ? <AddActionModal exchange={exchange} closeModal={() => { setShowAddAction(false); }} />
    : (
      <p>
        <button className='button is-primary' onClick={() => { setShowAddAction(true); }}>
          Add New Action
        </button>
      </p>
    );

  return (
    <div>
      <h3>Actions</h3>

      {addAction}

      <DepositActionTable exchange={exchange} />
      <WithdrawalActionTable exchange={exchange} />
    </div>
  );
}