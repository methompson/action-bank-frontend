import { useState, ChangeEvent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { actions, selectors } from 'store';

import {
  WithdrawalAction,
  Exchange,
  RequestStatusType,
} from 'store/action-bank/action-bank-types';

interface WithdrawalsProps {
  exchange: Exchange,
  closeModal: () => void,
}

let prevActionStatus: RequestStatusType | null;

export default function WithdrawalsModal(props: WithdrawalsProps) {
  const dispatch = useDispatch();

  const { withdrawalActions } = props.exchange;
  const initialWithdrawalAction = withdrawalActions[0]?.name ?? '';

  const [withdrawalAction, setWithdrawalAction] = useState(initialWithdrawalAction);
  const [isActionValid, setIsActionValid] = useState(true);

  const [uomQuant, setUomQuant] = useState(1);
  const [isUomQuantValid, setIsUomQuantValid] = useState(true);

  const [busy, setBusy] = useState(false);

  const withdrawalStatus = useSelector(selectors.withdrawalStatus);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (prevActionStatus === RequestStatusType.Pending) {
      if (withdrawalStatus.status === RequestStatusType.Success) {
        props.closeModal();

        dispatch(actions.addSuccessMessage({
          message: `Withdrew Funds`,
        }));
      } else if (withdrawalStatus.status === RequestStatusType.Fail) {
        setBusy(false);
        dispatch(actions.addErrorMessage({
          message: withdrawalStatus.msg,
        }));
      }
    }

    prevActionStatus = withdrawalStatus.status;
  });

  let selectedWithdrawalAction: WithdrawalAction | null = null;

  for (const action of withdrawalActions) {
    if (action.name === withdrawalAction) {
      selectedWithdrawalAction = action;
    }
  }

  if (withdrawalActions.length === 0 || selectedWithdrawalAction === null) {
    return (
      <div className='content'>
        <h3>No Withdrawal Actions Available.</h3>
        <h5>Add some withdrawal actions before you add withdrawal.</h5>
      </div>
    );
  }

  const withdrawalActionsList = withdrawalActions.map((action) => {
    return <option value={action.name} key={action.id}>{action.name}</option>;
  });

  const getWithdrawalAction = (): WithdrawalAction | null => {
    for (const ac of withdrawalActions) {
      if (withdrawalAction === ac.name) {
        return ac;
      }
    }

    return null;
  };

  const addWithdrawal = () => {
    const _isActionValid = withdrawalActions.reduce((acc, cur) => {
      if (acc === true) return true;
      return cur.name === withdrawalAction;
    }, false);

    const _isUomQuantValid = uomQuant > 0;

    setIsUomQuantValid(_isUomQuantValid);
    setIsActionValid(_isActionValid);

    if (!_isActionValid || !_isUomQuantValid) {
      console.log('Invalid Withdrawal Action or invalid uomQuant');
      return;
    }

    const action = getWithdrawalAction();

    if (action === null) {
      console.log('Invalid Action');
      return;
    }

    setBusy(true);

    dispatch(actions.addWithdrawal({
      withdrawalAction: action,
      quantity: uomQuant,
    }));
  };

  console.log('Withdrawal Modal');

  const { withdrawalQuantity: numerator, uomQuantity: denominator } = selectedWithdrawalAction;
  const totalWithdrawal = uomQuant * (numerator / denominator);
  const newCurrency = props.exchange.totalCurrency - totalWithdrawal;

  const changeUomQuantity = (ev:ChangeEvent<HTMLInputElement>) => setUomQuant(parseFloat(ev.target.value));
  const changeWithdrawalAction = (ev:ChangeEvent<HTMLSelectElement>) => setWithdrawalAction(ev.target.value);

  const buttonDisabled = busy || newCurrency < 0 || !isActionValid || !isUomQuantValid;

  return (
    <div className='content'>
      <h3>Withdrawal Some Actions</h3>

      <div className='field'>
        <label className='label'>Action</label>
        <div className='control'>
          <div className={'select' + (isActionValid ? '' : ' is-danger')}>
            <select onChange={changeWithdrawalAction} value={withdrawalAction}>
              {withdrawalActionsList}
            </select>
          </div>
        </div>
        <p className={'help is-danger opacity-fade' + (isActionValid ? ' invisible' : '')}>
          You Must Select an Action Type
        </p>
      </div>

      <div className='field'>
        <label className='label'>{selectedWithdrawalAction.uom}</label>
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
          Total Currency To Withdrawal: {totalWithdrawal}
        </div>

        <div className={newCurrency < 0 ? 'has-text-danger' : ''}>
          New Total Currency: {newCurrency.toFixed(2)}
        </div>
      </div>

      <div className='field'>
        <div className='control'>
          <button
            disabled={buttonDisabled}
            className={'button is-primary' + (busy ? ' is-loading' : '')}
            onClick={addWithdrawal}>
            Save
          </button>
        </div>
      </div>

    </div>
  );
}