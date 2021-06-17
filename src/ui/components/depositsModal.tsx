import { useState, ChangeEvent } from 'react';

import { Exchange } from 'store/action-bank/action-bank-types';

interface DepositsProps {
  exchange: Exchange,
}

export default function DepositsModal(props: DepositsProps) {
  const { depositActions } = props.exchange;
  const initialDepositAction = depositActions[0]?.name ?? '';

  const [depositAction, setDepositAction] = useState(initialDepositAction);
  const [isDepositActionValid, setIsDepositActionValid] = useState(true);

  const [uomQuant, setUomQuant] = useState(1);
  const [isUomQuantValid, setIsUomQuantValid] = useState(true);

  const [busy, setBusy] = useState(false);

  const changeUomQuantity = (ev:ChangeEvent<HTMLInputElement>) => setUomQuant(parseFloat(ev.target.value));
  const changeDepositAction = (ev:ChangeEvent<HTMLSelectElement>) => setDepositAction(ev.target.value);

  const addNewDeposit = () => {
    const _isDepositActionValid = depositActions.reduce((acc, cur) => {
      if (acc === true) return true;
      return cur.name === depositAction;
    }, false);

    const _isUomQuantValid = uomQuant > 0;

    setIsUomQuantValid(_isUomQuantValid);
    setIsDepositActionValid(_isDepositActionValid);

    if (!_isDepositActionValid || _isUomQuantValid) {
      setBusy(false);
      return;
    }
  };

  if (depositActions.length === 0) {
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

  let selectedDepositAction = depositActions[0];

  for (const action of depositActions) {
    if (action.name === depositAction) {
      selectedDepositAction = action;
    }
  }

  return (
    <div className='content'>
      <h3>Deposit Some Actions</h3>

      <div className='field'>
        <label className='label'>Action Type</label>
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

      <div className='field'>
        <div className='control'>
          <button
            disabled={busy}
            className={'button is-primary' + (busy ? ' is-loading' : '')}
            onClick={addNewDeposit}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}