import { useState, ChangeEvent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { actions, selectors } from 'store';
import {
  DepositAction,
  Exchange,
  RequestStatusType,
} from 'store/action-bank/action-bank-types';

interface DepositsProps {
  exchange: Exchange,
  closeModal: () => void,
}

let prevActionStatus: RequestStatusType | null;

export default function DepositsModal(props: DepositsProps) {
  const dispatch = useDispatch();

  const { depositActions } = props.exchange;
  const initialDepositAction = depositActions[0]?.name ?? '';

  const [depositAction, setDepositAction] = useState(initialDepositAction);
  const [isDepositActionValid, setIsDepositActionValid] = useState(true);

  const [uomQuant, setUomQuant] = useState(1);
  const [isUomQuantValid, setIsUomQuantValid] = useState(true);

  const [busy, setBusy] = useState(false);

  const depositStatus = useSelector(selectors.depositStatus);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (prevActionStatus === RequestStatusType.Pending) {
      if (depositStatus.status === RequestStatusType.Success) {
        props.closeModal();

        dispatch(actions.addSuccessMessage({
          message: `Deposited Funds`,
        }));
      } else if (depositStatus.status === RequestStatusType.Fail) {
        setBusy(false);
        dispatch(actions.addErrorMessage({
          message: depositStatus.msg,
        }));
      }
    }

    prevActionStatus = depositStatus.status;
  });

  let selectedDepositAction: DepositAction | null = null;

  for (const action of depositActions) {
    if (action.name === depositAction) {
      selectedDepositAction = action;
    }
  }

  if (depositActions.length === 0 || selectedDepositAction === null) {
    return (
      <div className='content'>
        <h3>No Deposit Actions Available.</h3>
        <h5>Add some deposit actions before you add deposits.</h5>
      </div>
    );
  }

  const depositActionsList = depositActions.map((action) => {
    return <option value={action.name} key={action.id}>{action.name}</option>;
  });

  const getDepositAction = (): DepositAction | null => {
    for (const ac of depositActions) {
      if (depositAction === ac.name) {
        return ac;
      }
    }

    return null;
  };

  const addDeposit = () => {
    const _isDepositActionValid = depositActions.reduce((acc, cur) => {
      if (acc === true) return true;
      return cur.name === depositAction;
    }, false);

    const _isUomQuantValid = uomQuant > 0;

    setIsUomQuantValid(_isUomQuantValid);
    setIsDepositActionValid(_isDepositActionValid);

    if (!_isDepositActionValid || !_isUomQuantValid) {
      console.log('Invalid Deposit Action or invalid uomQuant');
      return;
    }

    const action = getDepositAction();

    if (action === null) {
      console.log('Invalid Action');
      return;
    }

    setBusy(true);

    dispatch(actions.addDeposit({
      depositAction: action,
      quantity: uomQuant,
    }));
  };

  console.log('Deposit Modal');

  const { depositQuantity: numerator, uomQuantity: denominator } = selectedDepositAction;
  const totalDeposit = uomQuant * (numerator / denominator);

  const changeUomQuantity = (ev:ChangeEvent<HTMLInputElement>) => setUomQuant(parseFloat(ev.target.value));
  const changeDepositAction = (ev:ChangeEvent<HTMLSelectElement>) => setDepositAction(ev.target.value);

  return (
    <div className='content'>
      <h3>Deposit Some Actions</h3>

      <div className='field'>
        <label className='label'>Action</label>
        <div className='control'>
          <div className={'select' + (isDepositActionValid ? '' : ' is-danger')}>
            <select onChange={changeDepositAction} value={depositAction}>
              {depositActionsList}
            </select>
          </div>
        </div>
        <p className={'help is-danger opacity-fade' + (isDepositActionValid ? ' invisible' : '')}>
          You Must Select an Action Type
        </p>
      </div>

      <div className='field'>
        <label className='label'>{selectedDepositAction.uom}</label>
        <input
          className='input'
          type='number'
          min='0'
          placeholder='Name'
          value={uomQuant}
          onChange={changeUomQuantity} />
        <p className={'help is-danger opacity-fade' + (isUomQuantValid ? ' invisible' : '')}>
          This Must be a Number greater than 0
        </p>
      </div>

      <div className='block'>
        <div>
          Total Currency To Add: {totalDeposit}
        </div>
        <div>
          New Total Currency: {props.exchange.totalCurrency + totalDeposit}
        </div>
      </div>

      <div className='field'>
        <div className='control'>
          <button
            disabled={busy}
            className={'button is-primary' + (busy ? ' is-loading' : '')}
            onClick={addDeposit}>
            Save
          </button>
        </div>
      </div>

    </div>
  );
}